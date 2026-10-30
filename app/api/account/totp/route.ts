import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/users-store";
import {
  generateBackupCodes,
  generateSecret,
  otpauthURL,
  verifyTotp,
} from "@/lib/totp";
import { qrSvg } from "@/lib/qr";
import { getSession, getSessionUser, sessionCookie, sessionFor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

async function manager() {
  const s = await getSession();
  if (!s || s.role !== "manager") return null;
  const user = await getSessionUser(s);
  return user && user.role === "manager" && user.active ? { s, user } : null;
}

// وضعیت فعلی ورود دومرحله‌ای + (در صورت نیاز) کلید در انتظار تأیید
export async function GET() {
  const ctx = await manager();
  if (!ctx) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403, headers: noStore });

  const { user } = ctx;
  if (user.totpEnabled) {
    return NextResponse.json({ enabled: true, backupCodesLeft: (user.backupCodes ?? []).length }, { headers: noStore });
  }

  // کلید در انتظار اگر قبلاً ساخته شده باشد دوباره استفاده می‌شود.
  let secret = user.totpSecret;
  if (!secret) {
    secret = generateSecret();
    const users = await getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return NextResponse.json({ error: "حساب یافت نشد." }, { status: 404, headers: noStore });
    users[idx] = { ...users[idx], totpSecret: secret };
    await saveUsers(users);
  }

  const uri = otpauthURL(secret, user.username || user.name);
  return NextResponse.json(
    { enabled: false, secret, uri, qr: await qrSvg(uri) },
    { headers: noStore },
  );
}

// فعال‌سازی/غیرفعال‌سازی/ساخت مجدد کلید
export async function POST(req: Request) {
  const ctx = await manager();
  if (!ctx) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403, headers: noStore });
  const { user } = ctx;

  const b = await req.json().catch(() => null);
  const action = String(b?.action ?? "");
  const users = await getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx === -1) return NextResponse.json({ error: "حساب یافت نشد." }, { status: 404, headers: noStore });
  const me = users[idx];

  if (action === "confirm") {
    const code = String(b?.code ?? "").replace(/\D/g, "");
    if (!me.totpSecret) return NextResponse.json({ error: "ابتدا کلید ساخته نشده است." }, { status: 400, headers: noStore });
    if (!verifyTotp(me.totpSecret, code)) {
      return NextResponse.json({ error: "کد وارد‌شده درست نیست؛ ساعت گوشی را بررسی کنید." }, { status: 400, headers: noStore });
    }
    const { plain, hashed } = generateBackupCodes();
    users[idx] = { ...me, totpEnabled: true, totpConfirmedAt: new Date().toISOString(), backupCodes: hashed };
    await saveUsers(users);
    // sid عوض می‌شود؛ نشست فعلی هم با نشست تازه و بدون محدودیت «setup» جایگزین می‌شود.
    const res = NextResponse.json({ ok: true, backupCodes: plain, redirect: "/admin" }, { headers: noStore });
    res.cookies.set(sessionCookie(sessionFor(users[idx]), false));
    return res;
  }

  if (action === "disable") {
    if (!me.totpEnabled) return NextResponse.json({ error: "ورود دومرحله‌ای فعال نیست." }, { status: 400, headers: noStore });
    const pass = String(b?.password ?? "");
    const { verifyPassword } = await import("@/lib/users-store");
    if (!verifyPassword(pass, me.passwordHash)) {
      return NextResponse.json({ error: "برای غیرفعال‌سازی، رمز عبور فعلی را درست وارد کنید." }, { status: 400, headers: noStore });
    }
    users[idx] = { ...me, totpEnabled: false, totpSecret: undefined, backupCodes: undefined };
    await saveUsers(users);
    // sid عوض می‌شود (چون به totpEnabled وابسته است)؛ برای اینکه مدیر بلافاصله بیرون نیفتد،
    // یک نشست تازه صادر می‌کنیم تا فقط همین مرورگر معتبر بماند.
    const res = NextResponse.json({ ok: true, enabled: false }, { headers: noStore });
    res.cookies.set(sessionCookie(sessionFor(users[idx]), false));
    return res;
  }

  if (action === "regen") {
    if (me.totpEnabled) return NextResponse.json({ error: "ابتدا ورود دومرحله‌ای را غیرفعال کنید." }, { status: 400, headers: noStore });
    const secret = generateSecret();
    users[idx] = { ...me, totpSecret: secret };
    await saveUsers(users);
    const uri = otpauthURL(secret, me.username || me.name);
    return NextResponse.json({ ok: true, secret, uri, qr: await qrSvg(uri) }, { headers: noStore });
  }

  return NextResponse.json({ error: "درخواست نامعتبر." }, { status: 400, headers: noStore });
}
