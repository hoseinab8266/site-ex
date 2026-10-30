import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "@/lib/users-store";
import { matchBackupCode, verifyTotp } from "@/lib/totp";
import { digits, safeNext, sessionCookie, sessionFor, verifyTicket } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// مرحلهٔ دوم ورود مدیر: تأیید کد Google Authenticator یا کد پشتیبان.
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const ticket = String(b?.ticket ?? "");
  const code = digits(String(b?.code ?? "").trim());

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  if (!rateLimit(`totp:${ip}`, 10, 5 * 60_000)) {
    return NextResponse.json({ error: "تلاش‌های ناموفق زیاد بود. چند دقیقه دیگر دوباره امتحان کنید." }, { status: 429 });
  }

  const t = verifyTicket(ticket);
  if (!t) return NextResponse.json({ error: "زمان این مرحله به پایان رسیده است؛ دوباره وارد شوید." }, { status: 400 });
  if (!code) return NextResponse.json({ error: "کد ورود دومرحله‌ای را وارد کنید." }, { status: 400 });

  const users = await getUsers();
  const user = users.find((u) => u.id === t.uid);
  if (!user || !user.active || user.role !== "manager" || !user.totpEnabled || !user.totpSecret) {
    return NextResponse.json({ error: "ورود دومرحله‌ای برای این حساب فعال نیست." }, { status: 403 });
  }

  let ok = verifyTotp(user.totpSecret, code);

  // اگر کد ۶ رقمی نبود یا درست نبود، کد پشتیبان را امتحان می‌کنیم.
  if (!ok && /^[A-Za-z0-9]{8}$/.test(String(b?.code ?? "").replace(/[\s-]/g, ""))) {
    const idx = matchBackupCode(String(b?.code ?? ""), user.backupCodes ?? []);
    if (idx >= 0) {
      user.backupCodes = (user.backupCodes ?? []).filter((_, i) => i !== idx);
      await saveUsers(users);
      ok = true;
    }
  }
  if (!ok) return NextResponse.json({ error: "کد ورود دومرحله‌ای درست نیست." }, { status: 401 });

  user.lastLoginAt = new Date().toISOString();
  await saveUsers(users);

  const res = NextResponse.json({ ok: true, redirect: safeNext(b?.next, "manager") });
  res.cookies.set(sessionCookie(sessionFor(user), false));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
