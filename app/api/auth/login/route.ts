import { NextResponse } from "next/server";
import { checkLogin, digits, safeNext, sessionFor, sessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// محدودیت تلاش ناموفق (در حافظه؛ در مرحله بک‌اند به Redis/دیتابیس منتقل شود)
const tries = new Map<string, { n: number; until: number }>();

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const id = digits(String(b?.id ?? "").trim());
  const pass = String(b?.password ?? "");
  if (!id || !pass) return NextResponse.json({ error: "نام کاربری و رمز عبور را وارد کنید." }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";
  const key = `${ip}|${id.toLowerCase()}`;
  if (!rateLimit(`login:${key}`, 8, 10 * 60_000)) {
    return NextResponse.json({ error: "تلاش‌های ناموفق زیاد بود. ۱۰ دقیقه دیگر دوباره امتحان کنید." }, { status: 429 });
  }

  const cur = tries.get(key) ?? { n: 0, until: 0 };
  if (cur.until > Date.now()) {
    return NextResponse.json({ error: "تلاش‌های ناموفق زیاد بود. ۱۰ دقیقه دیگر دوباره امتحان کنید." }, { status: 429 });
  }

  const acc = await checkLogin(id, pass);
  if (!acc || acc.role !== "buyer") {
    // ورود عمومی فقط برای مشتریان است؛ کارکنان باید از مسیر اختصاصی وارد شوند.
    // پاسخ یکسان برای «حساب ناموجود» و «رمز اشتباه» تا اطلاعاتی لو نرود.
    cur.n += 1;
    if (cur.n >= 5) { cur.until = Date.now() + 10 * 60_000; cur.n = 0; }
    tries.set(key, cur);
    return NextResponse.json({ error: "نام کاربری یا رمز عبور درست نیست." }, { status: 401 });
  }
  tries.delete(key);

  const res = NextResponse.json({ ok: true, redirect: safeNext(b?.next, acc.role) });
  res.cookies.set(sessionCookie(sessionFor(acc), false));
  res.headers.set("Cache-Control", "no-store");
  return res;
}
