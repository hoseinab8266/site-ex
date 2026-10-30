import { NextResponse, type NextRequest } from "next/server";

// میان‌افزار لبه (Edge) — سه کار انجام می‌دهد:
// ۱) مسیر پنهانِ ورود کارکنان: ADMIN_LOGIN_PATH → بازنویسی به /admin/login و ۴۰۴ کردن مسیر مستقیم
// ۲) فهرست سفید IP برای همهٔ مسیرهای مدیریتی و ورود کارکنان
// ۳) افزودن سرصفحه‌های امنیتی به همهٔ پاسخ‌ها

/** سرصفحه‌های امنیتی پایه برای همهٔ پاسخ‌ها */
function harden(res: NextResponse) {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

/** ۴۰۴ برای پنهان‌کردن وجود مسیر (نه ۴۰۳، تا مسیر لو نرود) */
const hide = () => harden(new NextResponse(null, { status: 404 }));

/** نرمال‌سازی IP: حذف پیشوند ::ffff:، تبدیل ::1 به 127.0.0.1 و حذف پورت IPv4 */
function cleanIp(raw: string) {
  let ip = (raw || "").trim().replace(/^::ffff:/i, "");
  if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.split(":")[0];
  if (ip === "::1") ip = "127.0.0.1";
  return ip;
}

/** IP کاربر بر پایهٔ سرصفحه‌های پراکسی */
function clientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return cleanIp(first || req.headers.get("x-real-ip") || "");
}

const list = (v?: string) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // مسیر پنهان ورود کارکنان (اگر تنظیم شده باشد)
  const hidden = (process.env.ADMIN_LOGIN_PATH || "").replace(/^\/+|\/+$/g, "");
  const hiddenPath = hidden ? `/${hidden}` : "";

  // مسیرهای مدیریتی که مشمول محدودیت IP هستند
  const guarded =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === hiddenPath ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/auth/admin-login") ||
    pathname.startsWith("/api/auth/totp") ||
    pathname.startsWith("/api/account/totp");

  // فهرست سفید IP: خالی باشد یعنی محدودیتی اعمال نمی‌شود (تا پیش از تنظیم قفل نشویم)
  const allowed = list(process.env.ADMIN_ALLOWED_IPS);
  if (guarded && allowed.length > 0) {
    const ip = clientIp(req);
    const ok = allowed.some((p) => (p.endsWith("*") ? ip.startsWith(p.slice(0, -1)) : ip === cleanIp(p)));
    if (!ok) return hide();
  }

  // مسیر پنهان: درخواست به /<secret> به صفحهٔ ورود کارکنان بازنویسی می‌شود
  if (hiddenPath && pathname === hiddenPath) {
    return harden(NextResponse.rewrite(new URL(`/admin/login${search}`, req.url)));
  }
  // دسترسی مستقیم به مسیر واقعی، وقتی مسیر پنهان فعال است، وجود ندارد
  if (hiddenPath && pathname === "/admin/login") return hide();

  return harden(NextResponse.next());
}

export const config = {
  // فایل‌های ایستا و آپلودها از میان‌افزار عبور نمی‌کنند
  matcher: ["/((?!_next/static|_next/image|favicon.ico|avatars/|uploads/).*)"],
};
