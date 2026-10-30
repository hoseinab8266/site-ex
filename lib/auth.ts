import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getUsers, verifyPassword, type ManagedUser } from "@/lib/users-store";

export { digits } from "@/lib/fa";

export type Role = "manager" | "member" | "buyer";
export type Session = {
  name: string;
  role: Role;
  exp: number;
  uid?: string;
  /** شناسهٔ نشست؛ با تغییر رمز یا وضعیت ورود دومرحله‌ای باطل می‌شود (لغو نشست) */
  sid?: string;
  /** برای مدیر بدون ورود دومرحله‌ای: فقط دسترسی به صفحهٔ فعال‌سازی امنیت */
  scope?: "setup";
};
export const COOKIE = "polyrez_session";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET تنظیم نشده است");
  return s || "dev-only-secret-change-me";
}
const mac = (d: string) => createHmac("sha256", secret()).update(d).digest("base64url");

export function signSession(s: Session) {
  const d = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${d}.${mac(d)}`;
}

export function verifySession(v?: string): Session | null {
  if (!v) return null;
  const [d, m] = v.split(".");
  if (!d || !m) return null;
  const a = Buffer.from(m);
  const b = Buffer.from(mac(d));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(d, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}

/** شناسهٔ نشست بر پایهٔ رمز عبور و وضعیت ورود دومرحله‌ای؛ با هر تغییر، نشست‌های قبلی باطل می‌شوند. */
export function sessionId(user: Pick<ManagedUser, "passwordHash" | "totpEnabled">): string {
  return createHash("sha256")
    .update(`${user.passwordHash}|${user.totpEnabled ? "1" : "0"}`)
    .digest("hex")
    .slice(0, 16);
}

/** ساخت نشست زندهٔ کاربر (شامل sid). */
export function sessionFor(user: ManagedUser, remember = false): Session {
  const staff = user.role !== "buyer";
  const exp = Date.now() + (staff ? 12 * 3600_000 : (remember ? 7 : 1) * 864e5);
  return { name: user.name, role: user.role, uid: user.id, exp, sid: sessionId(user) };
}

/** بررسی زندهٔ نشست: کاربر باید وجود داشته، فعال باشد، نقش و sid او با نشست بخواند. */
async function liveSession(s: Session | null): Promise<Session | null> {
  if (!s) return null;
  if (!s.uid) return null; // نشست‌های قدیمی بدون شناسه معتبر نیستند
  const users = await getUsers();
  const user = users.find((u) => u.id === s.uid);
  if (!user || !user.active || user.role !== s.role) return null;
  if (s.sid !== sessionId(user)) return null;
  return s;
}

export async function getSession() {
  const c = await cookies();
  return liveSession(verifySession(c.get(COOKIE)?.value));
}

export async function getSessionUser(session: Session) {
  const users = await getUsers();
  return users.find((u) => (session.uid ? u.id === session.uid : u.name === session.name && u.role === session.role)) ?? null;
}

// حساب‌ها از فایل سرور خوانده می‌شوند تا ویرایش پنل مدیریت در ورود هم اعمال شود.
export async function checkLogin(id: string, pass: string): Promise<ManagedUser | null> {
  const normalized = id.toLowerCase();
  const users = await getUsers();
  const user = users.find((u) => u.username.toLowerCase() === normalized || (!!u.email && u.email.toLowerCase() === normalized) || (!!u.mobile && u.mobile === id));
  if (!user || !user.active || !verifyPassword(pass, user.passwordHash)) return null;
  return user;
}

// ---------- بلیت کوتاه‌مدت مرحلهٔ دوم ورود کارکنان ----------
// پس از تأیید رمز عبور، تا وارد کردن کد دومرحله‌ای نشست صادر نمی‌شود؛
// فقط یک بلیت امضاشدهٔ ۲ دقیقه‌ای با دامنهٔ مستقل از توکن نشست صادر می‌شود.
const TICKET_TTL = 2 * 60_000;

export function signTicket(uid: string) {
  const d = Buffer.from(JSON.stringify({ uid, exp: Date.now() + TICKET_TTL })).toString("base64url");
  return `t1.${d}.${mac(`ticket|${d}`)}`;
}

export function verifyTicket(t?: string): { uid: string } | null {
  if (!t) return null;
  const [v, d, m] = t.split(".");
  if (v !== "t1" || !d || !m) return null;
  const a = Buffer.from(m);
  const b = Buffer.from(mac(`ticket|${d}`));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(d, "base64url").toString()) as { uid: string; exp: number };
    return p.exp > Date.now() && p.uid ? { uid: p.uid } : null;
  } catch {
    return null;
  }
}

export const homeFor = (r: Role) => (r === "buyer" ? "/dashboard" : "/admin");

/** نشانی صفحهٔ ورود کارکنان؛ اگر مسیر پنهان تنظیم شده باشد همان برگردانده می‌شود. */
export function adminLoginPath() {
  const hidden = (process.env.ADMIN_LOGIN_PATH || "").replace(/^\/+|\/+$/g, "");
  return hidden ? `/${hidden}` : "/admin/login";
}

export function safeNext(n: unknown, role: Role) {
  const hiddenPath = adminLoginPath();
  const ok =
    typeof n === "string" &&
    n.startsWith("/") &&
    !n.startsWith("//") &&
    !n.startsWith("/login") &&
    !n.startsWith("/admin/login") &&
    !(hiddenPath !== "/admin/login" && n.startsWith(hiddenPath)) &&
    !n.startsWith(role === "buyer" ? "/admin" : "/dashboard");
  if (!ok) return homeFor(role);
  // کارکنان هرگز نباید به مسیر مرحلهٔ دوم ورود برگردند
  if (role !== "buyer" && n.startsWith("/admin/security")) return "/admin";
  return n;
}

export function sessionCookie(s: Session, remember: boolean) {
  // نشست کارکنان همیشه کوتاه (۱۲ ساعت) است و «مرا به خاطر بسپار» نمی‌گیرد.
  const staff = s.role !== "buyer";
  return {
    name: COOKIE,
    value: signSession(s),
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(staff ? { maxAge: 12 * 3600 } : remember ? { maxAge: 7 * 86400 } : {}),
  };
}

export const MOBILE = /^09\d{9}$/;
export const strongPass = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
