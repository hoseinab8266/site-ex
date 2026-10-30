import { NextResponse } from "next/server";
import { checkLogin, digits, safeNext, sessionFor, sessionCookie, signTicket } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ورود کارکنان (مدیر/کارشناس فروش) — جدا از ورود عمومی مشتریان.
// مرحلهٔ ۱: نام کاربری و رمز عبور؛ مرحلهٔ ۲ (مدیر با ورود دومرحله‌ای فعال): کد Google Authenticator.
const tries = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const id = digits(String(b?.id ?? "").trim());
  const pass = String(b?.password ?? "");
  if (!id || !pass) return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const key = `${ip}|${id.toLowerCase()}`;
  if (!rateLimit(`staff-login:${key}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "تلاش‌های ناموفق زیاد بود. ۱۰ دقیقه دیگر دوباره امتحان کنید." }, { status: 429 });
  }

  const cur = tries.get(key) ?? { n: 0, until: 0 };
  if (cur.until > Date.now()) {
    return NextResponse.json({ error: "تلاش‌های ناموفق زیاد بود. ۱۰ دقیقه دیگر دوباره امتحان کنید." }, { status: 429 });
  }

  const acc = await checkLogin(id, pass);
  if (!acc || acc.role === "buyer") {
    cur.n += 1;
    if (cur.n >= 5) { cur.until = Date.now() + 10 * 60_000; cur.n = 0; }
    tries.set(key, cur);
    return NextResponse.json({ error: "نام کاربری یا رمز عبور درست نیست." }, { status: 401 });
  }
  tries.delete(key);

  // مدیر بدون ورود دومرحله‌ای: اگر ADMIN_TOTP_REQUIRED=false باشد، اجبار راه‌اندازی نادیده گرفته می‌شود.
  const totpRequired = process.env.ADMIN_TOTP_REQUIRED !== "false";
  if (acc.role === "manager" && !acc.totpEnabled && totpRequired) {
    const res = NextResponse.json({ ok: true, redirect: "/admin/security?setup=1" });
    res.cookies.set(sessionCookie({ ...sessionFor(acc), scope: "setup" }, false));
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  // مدیر با ورود دومرحله‌ای: تا تأیید کد، نشستی صادر نمی‌شود.
  if (acc.role === "manager" && acc.totpEnabled) {
    return NextResponse.json(
      { ok: true, totpRequired: true, ticket: signTicket(acc.id) },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  // کارشناس فروش: ورود یک‌مرحله‌ای
  const res = NextResponse.json({ ok: true, redirect: safeNext(b?.next, acc.role) });
  res.cookies.set(sessionCookie(sessionFor(acc), false));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
