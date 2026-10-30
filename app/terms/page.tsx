import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/lib/data";

export const metadata: Metadata = {
  title: "شرایط و قوانین",
  description:
    "شرایط استفاده از فروشگاه پلیرز؛ ثبت سفارش، صدور پیش‌فاکتور، پرداخت، ارسال، مرجوعی و مسئولیت‌ها.",
};

const sections = [
  {
    title: "۱. پذیرش شرایط",
    body: [
      "استفاده از فروشگاه پلیرز به معنای پذیرش این شرایط است. اگر با هر بخشی از آن موافق نیستید، لطفاً از ثبت سفارش خودداری کنید.",
      "این شرایط ممکن است بر اساس تغییر رویه‌های فروش یا الزامات قانونی به‌روزرسانی شود؛ نسخهٔ معتبر همان است که در همین صفحه منتشر می‌شود.",
    ],
  },
  {
    title: "۲. حساب کاربری",
    body: [
      "برای ثبت سفارش و مشاهدهٔ پیش‌فاکتورها باید با شمارهٔ موبایل خود وارد شوید. مسئولیت حفظ رمز عبور و صحت اطلاعات حساب بر عهدهٔ شماست.",
      "اطلاعات هویتی و شرکتی واردشده در پروفایل، مبنای صدور پیش‌فاکتور و فاکتور رسمی است؛ درستی آن‌ها را پیش از ثبت سفارش بررسی کنید.",
    ],
  },
  {
    title: "۳. قیمت و پیش‌فاکتور",
    body: [
      "قیمت‌های نمایش‌داده‌شده در سایت راهنما هستند و ممکن است بر اساس نرخ روز مواد اولیه تغییر کنند. قیمت نهایی تنها در پیش‌فاکتور رسمی تأیید می‌شود.",
      "موجودی انبار و زمان تحویل پس از ثبت درخواست توسط کارشناس فروش تأیید و به شما اعلام می‌شود.",
    ],
  },
  {
    title: "۴. ثبت سفارش و پرداخت",
    body: [
      "سفارش پس از تأیید پیش‌فاکتور و پرداخت مبلغ، وارد مرحلهٔ آماده‌سازی می‌شود. تا پیش از پرداخت، امکان لغو سفارش وجود دارد.",
      "در صورت تغییر شرایط بازار پیش از پرداخت، همکاران ما پیش از ادامهٔ فرایند با شما تماس می‌گیرند.",
    ],
  },
  {
    title: "۵. ارسال و تحویل",
    body: [
      "ارسال محصولات بر اساس توافق انجام‌شده در پیش‌فاکتور و از طریق باربری یا پیک انجام می‌شود. زمان تحویل به مقصد و روش حمل بستگی دارد.",
      "بررسی سالم‌بودن بسته‌بندی و وزن بار در زمان تحویل ضروری است؛ آسیب‌های حمل باید همان لحظه به راننده اعلام و ثبت شود.",
    ],
  },
  {
    title: "۶. مرجوعی و انصراف",
    body: [
      "به دلیل ماهیت مواد شیمیایی و پلیمری، بسته‌های بازشده یا خارج‌شده از انبار قابل بازگشت نیستند، مگر آنکه مغایرت با مشخصات فنی تأییدشده اثبات شود.",
      "اعلام مغایرت باید حداکثر تا ۴۸ ساعت پس از تحویل و همراه با مستندات (تصویر بسته‌بندی و برگهٔ فنی) ارسال شود.",
    ],
  },
  {
    title: "۷. مسئولیت‌ها",
    body: [
      "اطلاعات فنی منتشرشده در سایت جنبهٔ راهنما دارد و جایگزین آزمایش‌های کنترل کیفیت شما نیست. انتخاب نهایی گرید بر اساس فرایند تولید شما انجام می‌شود.",
      "مسئولیت استفادهٔ نادرست از مواد، نگهداری غیراستاندارد یا ترکیب با مواد ناسازگار بر عهدهٔ خریدار است.",
    ],
  },
  {
    title: "۸. پشتیبانی",
    body: [
      "برای هر پرسش دربارهٔ این شرایط، سفارش یا مشخصات فنی، از راه‌های ارتباطی زیر با ما در تماس باشید.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <nav aria-label="مسیر صفحه" className="mb-5">
            <ol className="flex items-center gap-2 text-sm text-white/75">
              <li><Link href="/" className="hover:text-white">خانه</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-medium text-white">شرایط و قوانین</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold leading-[1.8] md:text-4xl">شرایط و قوانین</h1>
          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            چارچوب ثبت سفارش، قیمت‌گذاری، ارسال و مرجوعی در فروشگاه پلیرز. لطفاً پیش از ثبت
            درخواست، این صفحه را بخوانید.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 md:py-16">
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title} className="rounded-2xl border border-line bg-white p-6">
              <h2 className="border-s-4 border-action ps-3 text-xl font-bold">{s.title}</h2>
              <div className="mt-4 space-y-3 text-sm leading-8 text-ink/80">
                {s.body.map((p) => <p key={p}>{p}</p>)}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl bg-brand-soft p-6">
          <h2 className="text-lg font-bold">راه‌های ارتباطی</h2>
          <dl className="mt-4 divide-y divide-line text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink/70">تلفن</dt>
              <dd className="font-medium"><bdi dir="ltr">{contact.phone}</bdi></dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink/70">ایمیل</dt>
              <dd className="font-medium"><bdi dir="ltr">{contact.email}</bdi></dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink/70">ساعات کاری</dt>
              <dd className="text-end font-medium">{contact.hours}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-action rounded-xl px-6 py-3 text-sm font-bold">تماس با ما</Link>
            <Link href="/privacy" className="inline-flex items-center whitespace-nowrap rounded-xl border border-brand px-6 py-3 text-sm font-medium text-brand hover:bg-white">
              سیاست حفظ حریم خصوصی
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
