// تبدیل ارقام لاتین/عربی به فارسی و برعکس؛ بدون وابستگی تا در کلاینت هم قابل استفاده باشد.
export const faDigits = (s: string | number) =>
  String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const digits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

// تاریخ امروز به شکل «۲۸ مهر ۱۴۰۵» برای نمایش در پنل.
export const faToday = () =>
  new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

// شمارهٔ سندی مثل PR-۱۰۴۹ یا PF-۲۱۰ بر اساس بیشترین شمارهٔ موجود.
export function nextDocId(prefix: string, existing: string[]) {
  let max = 0;
  for (const id of existing) {
    const n = Number(digits(String(id).replace(/[^0-9۰-۹٠-٩]/g, "")) || 0);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}-${faDigits(max + 1)}`;
}
