import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/lib/data";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "پلیرز فروشگاه آنلاین شرکت دانش‌بنیان آتیه رزین شریف است؛ تأمین مواد پلیمری و رزین‌های صنعتی با مشخصات فنی مستند و مشاوره تخصصی.",
};

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-1 shrink-0 text-action">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.5" />
    </svg>
  );
}

// ⚠️ اعداد و ادعاهای این صفحه را قبل از انتشار با اطلاعات واقعی شرکت تطبیق دهید.
const values = [
  {
    title: "مشخصات فنی روشن",
    text: "شاخص‌های کلیدی هر گرید و برگه فنی کنار محصول است تا انتخاب بر پایه عدد باشد، نه حدس.",
  },
  {
    title: "مشاوره پیش از خرید",
    text: "کاربرد و فرایندتان را بگویید؛ تیم فنی گرید مناسب یا جایگزین را پیشنهاد می‌دهد.",
  },
  {
    title: "شفافیت در قیمت و سفارش",
    text: "قیمت هر واحد دیده می‌شود و مبلغ نهایی و موجودی در پیش‌فاکتور رسمی تأیید می‌شود.",
  },
  {
    title: "پشتوانه پژوهشی",
    text: "دانش فنی و محصولات از یک شرکت دانش‌بنیان فعال در شیمی و مواد پلیمری می‌آید.",
  },
];

const process = [
  { n: "۱", title: "انتخاب گرید", text: "از میان دسته‌بندی‌ها و برگه‌های فنی، گرید مناسب را پیدا کنید." },
  { n: "۲", title: "پیش‌فاکتور رسمی", text: "مقدار موردنیاز را ثبت کنید تا پیش‌فاکتور برایتان صادر شود." },
  { n: "۳", title: "پرداخت و ارسال", text: "پس از تأیید پیش‌فاکتور، سفارش آماده ارسال می‌شود." },
];

const audiences = [
  "کارگاه‌ها و واحدهای تولیدی کوچک و متوسط",
  "سازندگان قطعات پلاستیکی و کامپوزیتی",
  "پیمانکاران پوشش کف و عایق‌کاری",
  "پژوهشگران و دانشجویانی که نمونه یا مقدار کم نیاز دارند",
];

export default function AboutPage() {
  return (
    <>
      {/* سرصفحه تیره، هم‌خانواده با قهرمان صفحه اصلی */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 25% 50%, rgba(11,107,120,.7), transparent 62%), linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "auto, 48px 48px, 48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-20">
          <nav aria-label="مسیر صفحه" className="mb-5">
            <ol className="flex items-center gap-2 text-sm text-white/75">
              <li><Link href="/" className="hover:text-white">خانه</Link></li>
              <li aria-hidden="true"><Chevron className="text-white/50" /></li>
              <li aria-current="page" className="font-medium text-white">درباره ما</li>
            </ol>
          </nav>
          <h1 className="max-w-3xl text-3xl font-bold leading-[1.8] md:text-4xl md:leading-[1.8]">
            خرید مواد پلیمری، <span className="text-action">روشن و قابل‌اتکا</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
            پلیرز فروشگاه آنلاین شرکت دانش‌بنیان آتیه رزین شریف است؛ جایی که مواد پلیمری و
            رزین‌های صنعتی را با مشخصات فنی مستند و مشاوره تخصصی تهیه می‌کنید.
          </p>
        </div>
      </section>

      {/* داستان */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-5 md:py-20">
        <div className="md:col-span-3">
          <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">چرا پلیرز؟</h2>
          <div className="mt-6 space-y-4 leading-9 text-ink/85">
            <p>
              شرکت آتیه رزین شریف در حوزه شیمی و مواد پلیمری فعالیت می‌کند و دانش فنی آن بر پایه
              پژوهش شکل گرفته است. در این مسیر دیدیم که خرید مواد پلیمری برای بسیاری از
              کارگاه‌ها و سازندگان کوچک، مبهم و وابسته به رابطه‌های شخصی است.
            </p>
            <p>
              پلیرز را ساخته‌ایم تا این تجربه تغییر کند: مشخصات هر گرید کنار محصول باشد، قیمت
              دیده شود، پیش‌فاکتور رسمی صادر شود و اگر کسی مطمئن نبود، یک کارشناس واقعی پاسخ بدهد.
            </p>
          </div>
        </div>

        <aside className="self-start rounded-2xl border border-line bg-white p-6 shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)] md:col-span-2">
          <h3 className="font-bold">مناسب چه کسانی است؟</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7">
            {audiences.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <Check />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      {/* ارزش‌ها */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">آنچه به آن پایبندیم</h2>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-line bg-paper p-6">
                <dt className="font-bold">{v.title}</dt>
                <dd className="mt-2 text-sm leading-7 text-ink/75">{v.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* فرایند */}
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">خرید چطور انجام می‌شود</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {process.map((st) => (
              <li key={st.n} className="rounded-xl bg-white p-6 shadow-[0_8px_24px_-14px_rgba(6,48,58,.45)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">
                  {st.n}
                </span>
                <h3 className="mt-4 font-bold">{st.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/75">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* تماس */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">با ما در تماس باشید</h2>
          <p className="mt-5 max-w-prose leading-8 text-ink/80">
            برای انتخاب گرید، درخواست پیش‌فاکتور یا هر پرسش فنی، همکاران ما در ساعات کاری پاسخگو
            هستند.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-action rounded-xl px-7 py-3.5 font-bold">
              تماس با ما
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center whitespace-nowrap rounded-xl border border-brand px-7 py-3.5 font-medium text-brand hover:bg-brand-soft"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>

        <dl className="divide-y divide-line self-start rounded-2xl border border-line bg-white px-6 text-sm">
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-ink/70">تلفن</dt>
            <dd className="font-medium"><bdi dir="ltr">{contact.phone}</bdi></dd>
          </div>
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-ink/70">ایمیل</dt>
            <dd className="font-medium"><bdi dir="ltr">{contact.email}</bdi></dd>
          </div>
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-ink/70">آدرس</dt>
            <dd className="text-end font-medium">{contact.address}</dd>
          </div>
          <div className="flex justify-between gap-4 py-4">
            <dt className="text-ink/70">ساعات کاری</dt>
            <dd className="text-end font-medium">{contact.hours}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
