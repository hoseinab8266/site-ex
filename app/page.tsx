import Link from "next/link";
import MoleculeHero from "@/components/MoleculeHero";
import Molecule3D from "@/components/Molecule3D";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { families } from "@/lib/data";
import { getCatalog } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";

function Chevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-action">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.5" />
    </svg>
  );
}

const trust = [
  "برگه فنی هر گرید",
  "مشاوره پیش از خرید",
  "صدور پیش‌فاکتور رسمی",
  "شرکت دانش‌بنیان",
];

const steps = [
  { n: "۱", title: "گرید را انتخاب کنید", text: "مشخصات و برگه فنی را ببینید یا کاربردتان را برای مشاوره بنویسید." },
  { n: "۲", title: "پیش‌فاکتور بگیرید", text: "مقدار موردنیاز را ثبت کنید تا پیش‌فاکتور رسمی برایتان صادر شود." },
  { n: "۳", title: "پرداخت و تحویل", text: "پس از تأیید پیش‌فاکتور، سفارش آماده ارسال می‌شود." },
];

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">{title}</h2>
      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-brand hover:underline"
      >
        {linkLabel}
        <Chevron />
      </Link>
    </div>
  );
}

const strengths = [
  {
    title: "مشخصات فنی کنار محصول",
    text: "شاخص‌های کلیدی هر گرید و برگه فنی را پیش از خرید می‌بینید.",
  },
  {
    title: "مشاوره قبل از خرید",
    text: "اگر گرید مناسب را نمی‌دانید، کاربردتان را بگویید تا پیشنهاد بدهیم.",
  },
  {
    title: "پشتوانه پژوهشی",
    text: "محصولات و دانش فنی از یک شرکت دانش‌بنیان فعال در شیمی پلیمر می‌آیند.",
  },
];

const heroBackground = {
  backgroundImage:
    "radial-gradient(ellipse at 25% 50%, rgba(11,107,120,.7), transparent 62%), linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
  backgroundSize: "auto, 48px 48px, 48px 48px",
};

export default async function Home() {
  const catalog = await getCatalog();
  const products = catalog.products;
  const articles = catalog.articles.filter((a) => a.published !== false);
  const [lead, ...rest] = articles;

  return (
    <>
      {/* قهرمان صفحه */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={heroBackground}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-3xl font-bold leading-[1.7] md:text-4xl md:leading-[1.7]">
              تأمین مواد پلیمری و رزین‌های صنعتی با <span className="text-action">مشخصات فنی مستند</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/80 md:text-lg">
              پلیرز، فروشگاه رسمی شرکت دانش‌بنیان آتیه رزین شریف. انتخاب گرید بر
              پایه برگه فنی، مشاوره تخصصی پیش از خرید و صدور پیش‌فاکتور.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="btn-action inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-bold"
              >
                مشاهده محصولات
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-white/40 px-7 py-3.5 font-medium hover:bg-white/10"
              >
                درخواست پیش‌فاکتور
              </Link>
            </div>
          </div>

          <figure className="w-full">
            <Molecule3D fallback={<MoleculeHero className="w-full" />} />
            <figcaption className="mt-1 flex items-center justify-center gap-2 text-xs text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-action" />
              موج نارنجی، رشد زنجیره در فرایند پلیمریزاسیون را نشان می‌دهد
            </figcaption>
          </figure>
        </div>
      </section>

      {/* نوار اعتماد */}
      <section className="border-b border-line bg-white">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-5 text-sm font-medium md:grid-cols-4">
          {trust.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check />
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* دسته‌بندی‌ها */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          title="دسته‌بندی محصولات"
          href="/products"
          linkLabel="همه محصولات"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((f) => (
            <CategoryCard key={f.slug} family={f} />
          ))}
        </div>
      </section>

      {/* محصولات منتخب */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <SectionHeading
          title="محصولات منتخب"
          href="/products"
          linkLabel="مشاهده همه"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* مراحل خرید */}
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <h2 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">خرید چطور انجام می‌شود</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((st) => (
              <li key={st.n} className="rounded-xl bg-white p-6 shadow-[0_8px_24px_-14px_rgba(6,48,58,.45)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">{st.n}</span>
                <h3 className="mt-4 font-bold">{st.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink/75">{st.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* معرفی شرکت */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              پلیرز، فروشگاه آتیه رزین شریف
            </h2>
            <p className="mt-5 max-w-prose leading-8 text-ink/80">
              شرکت دانش‌بنیان آتیه رزین شریف در حوزه شیمی و مواد پلیمری فعالیت
              می‌کند. پلیرز را ساخته‌ایم تا خرید مواد پلیمری برای کارگاه‌ها،
              سازندگان و پروژه‌های کوچک هم به‌اندازه سفارش‌های صنعتی روشن و
              قابل‌اتکا باشد.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-1 whitespace-nowrap font-medium text-brand hover:underline"
            >
              بیشتر درباره ما
              <Chevron />
            </Link>
          </div>

          <dl className="divide-y divide-line border-y border-line">
            {strengths.map((s) => (
              <div key={s.title} className="py-5">
                <dt className="font-bold">{s.title}</dt>
                <dd className="mt-1 text-sm leading-7 text-ink/75">{s.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* مقالات علمی */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <SectionHeading
          title="مقالات علمی"
          href="/articles"
          linkLabel="همه مقالات"
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <article className="rounded-xl bg-brand-soft p-8 lg:col-span-3">
            <p className="text-sm font-medium text-brand">{lead.category}</p>
            <h3 className="mt-3 text-2xl font-bold leading-10">
              <Link href={`/articles/${lead.slug}`} className="hover:text-brand">
                {lead.title}
              </Link>
            </h3>
            <p className="mt-4 max-w-prose leading-8 text-ink/80">
              {lead.excerpt}
            </p>
            <p className="mt-6 flex gap-4 text-sm text-ink/75">
              <span>{lead.date}</span>
              <span>مطالعه {lead.readMinutes.toLocaleString("fa-IR")} دقیقه</span>
            </p>
          </article>

          <ul className="divide-y divide-line border-y border-line lg:col-span-2">
            {rest.map((a) => (
              <li key={a.slug} className="py-5">
                <p className="text-sm font-medium text-brand">{a.category}</p>
                <h3 className="mt-1 font-bold leading-7">
                  <Link href={`/articles/${a.slug}`} className="hover:text-brand">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-2 flex gap-4 text-sm text-ink/75">
                  <span>{a.date}</span>
                  <span>
                    مطالعه {a.readMinutes.toLocaleString("fa-IR")} دقیقه
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* فراخوان مشاوره */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <div className="flex flex-col gap-6 rounded-2xl bg-brand px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-2xl font-bold">گرید مناسب را پیدا نکردید؟</h2>
            <p className="mt-2 max-w-xl leading-8 text-white/85">
              کاربرد و مقدار موردنیازتان را بنویسید؛ تیم فنی پلیرز گرید مناسب را
              پیشنهاد می‌دهد.
            </p>
          </div>
          <Link
            href="/consultation"
            className="btn-action inline-flex shrink-0 items-center justify-center rounded-xl px-7 py-3.5 font-bold"
          >
            درخواست مشاوره
          </Link>
        </div>
      </section>
    </>
  );
}
