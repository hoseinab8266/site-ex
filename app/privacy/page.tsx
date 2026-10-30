import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/lib/data";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description:
    "سیاست حفظ حریم خصوصی پلیرز؛ چه اطلاعاتی جمع‌آوری می‌شود، چگونه استفاده می‌شود و شما چه اختیاراتی دارید.",
};

const sections = [
  {
    title: "چه اطلاعاتی جمع‌آوری می‌کنیم",
    body: [
      "اطلاعاتی که خودتان در فرم‌های ثبت‌نام، پروفایل، تماس و درخواست مشاوره وارد می‌کنید: نام، شمارهٔ موبایل، ایمیل، نام شرکت، کد ملی، کد اقتصادی و نشانی.",
      "اطلاعات فنی محدود مانند نوع مرورگر و نشانی IP، تنها برای امنیت، جلوگیری از سوءاستفاده و بهبود عملکرد سایت.",
    ],
  },
  {
    title: "چرا این اطلاعات را لازم داریم",
    body: [
      "برای احراز هویت و ورود امن، صدور پیش‌فاکتور و فاکتور رسمی، هماهنگی ارسال و پاسخ به پرسش‌های فنی شما.",
      "برای اطلاع‌رسانی دربارهٔ وضعیت سفارش و در صورت رضایت شما، ارسال اطلاعات فنی و پیشنهادهای مرتبط.",
    ],
  },
  {
    title: "اشتراک‌گذاری با دیگران",
    body: [
      "اطلاعات شما فروخته یا اجاره داده نمی‌شود. تنها در حد لازم برای انجام سفارش (مثلاً شرکت حمل) یا در صورت الزام قانونی با مراجع ذی‌صلاح به اشتراک گذاشته می‌شود.",
      "خدمات پیام‌رسان و ارسال رمز یک‌بارمصرف از طریق سرویس‌های بیرونی انجام می‌شود و در آن حد، شمارهٔ موبایل شما برای تحویل پیام پردازش می‌گردد.",
    ],
  },
  {
    title: "امنیت اطلاعات",
    body: [
      "رمزهای عبور به‌صورت هش‌شده ذخیره می‌شوند و نشست‌های کاربری با امضای رمزنگاری‌شده اعتبارسنجی می‌شوند.",
      "دسترسی کارکنان به اطلاعات مشتریان بر اساس نقش محدود شده است و فقط برای پیگیری سفارش و پشتیبانی استفاده می‌شود.",
    ],
  },
  {
    title: "کوکی‌ها",
    body: [
      "برای نگه‌داشتن وضعیت ورود شما و حفظ سبد خرید از کوکی استفاده می‌کنیم. حذف کوکی‌های ضروری باعث خروج از حساب و از دست رفتن سبد خرید می‌شود.",
    ],
  },
  {
    title: "نگهداری و حذف",
    body: [
      "اطلاعات حساب تا زمانی که حساب فعال است و تا مدت محدود پس از آن، برای پاسخ به الزامات حسابداری و قانونی نگهداری می‌شود.",
      "برای حذف حساب یا اصلاح اطلاعات، از طریق پروفایل اقدام کنید یا با پشتیبانی تماس بگیرید.",
    ],
  },
  {
    title: "حقوق شما",
    body: [
      "دسترسی به اطلاعات ثبت‌شده، اصلاح آن و درخواست حذف حساب از حقوق شماست. برای اعمال این حقوق کافی است با ما در تماس باشید.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 md:py-16">
          <nav aria-label="مسیر صفحه" className="mb-5">
            <ol className="flex items-center gap-2 text-sm text-white/75">
              <li><Link href="/" className="hover:text-white">خانه</Link></li>
              <li aria-hidden="true" className="text-white/50">/</li>
              <li aria-current="page" className="font-medium text-white">حریم خصوصی</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold leading-[1.8] md:text-4xl">سیاست حفظ حریم خصوصی</h1>
          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            شفاف می‌گوییم چه اطلاعاتی از شما نگه می‌داریم، چرا لازمشان داریم و چگونه از آن‌ها
            محافظت می‌کنیم.
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
          <h2 className="text-lg font-bold">پرسشی دربارهٔ اطلاعات شما دارید؟</h2>
          <p className="mt-3 text-sm leading-8 text-ink/80">
            برای هر پرسش دربارهٔ داده‌های شخصی، یا درخواست اصلاح و حذف اطلاعات، با پشتیبانی
            پلیرز در تماس باشید.
          </p>
          <dl className="mt-4 divide-y divide-line text-sm">
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink/70">ایمیل</dt>
              <dd className="font-medium"><bdi dir="ltr">{contact.email}</bdi></dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-ink/70">تلفن</dt>
              <dd className="font-medium"><bdi dir="ltr">{contact.phone}</bdi></dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-action rounded-xl px-6 py-3 text-sm font-bold">تماس با ما</Link>
            <Link href="/terms" className="inline-flex items-center whitespace-nowrap rounded-xl border border-brand px-6 py-3 text-sm font-medium text-brand hover:bg-white">
              شرایط و قوانین
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
