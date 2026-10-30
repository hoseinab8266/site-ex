import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ArticleCard from "@/components/ArticleCard";
import { getCatalog } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مقالات علمی",
  description:
    "راهنمای انتخاب گرید، نکات کاربردی رزین‌ها و پلیمرها و اصول نگهداری مواد، از تیم فنی پلیرز.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ink/50">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default function ArticlesPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<ArticlesSkeleton />}>
      <ArticlesContent searchParams={searchParams} />
    </Suspense>
  );
}

function ArticlesSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-6xl animate-pulse gap-6 px-4 py-10 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-56 rounded-xl bg-brand-soft" />
      ))}
    </div>
  );
}

async function ArticlesContent({ searchParams }: Props) {
  const sp = await searchParams;
  const catalog = await getCatalog();
  const articles = catalog.articles.filter((a) => a.published !== false);
  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const catRaw = first(sp.category);
  const active = categories.includes(catRaw) ? catRaw : "";
  const list = active ? articles.filter((a) => a.category === active) : articles;
  const [lead, ...rest] = list;

  const chip = (on: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${
      on
        ? "border-ink bg-ink font-medium text-white"
        : "border-line bg-white hover:bg-brand-soft"
    }`;

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <nav aria-label="مسیر صفحه" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-ink/70">
              <li><Link href="/" className="hover:text-brand">خانه</Link></li>
              <li aria-hidden="true"><Chevron /></li>
              <li aria-current="page" className="font-medium text-ink">مقالات علمی</li>
            </ol>
          </nav>
          <h1 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">مقالات علمی</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/75">
            راهنمای انتخاب گرید، نکات کاربردی رزین‌ها و پلیمرها و اصول نگهداری مواد؛ نوشته تیم فنی
            پلیرز برای کسانی که با این مواد کار می‌کنند.
          </p>

          <ul aria-label="دسته‌بندی مقالات" className="mt-6 flex flex-wrap gap-2">
            <li>
              <Link href="/articles" aria-current={!active ? "true" : undefined} className={chip(!active)}>
                همه مقالات
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c}>
                <Link
                  href={`/articles?category=${encodeURIComponent(c)}`}
                  aria-current={active === c ? "true" : undefined}
                  className={chip(active === c)}
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        {lead ? (
          <>
            <article className="rounded-2xl bg-brand-soft p-6 md:p-10">
              <p className="text-sm font-medium text-brand">{lead.category}</p>
              <h2 className="mt-3 max-w-3xl text-xl font-bold leading-10 md:text-2xl md:leading-10">
                <Link href={`/articles/${lead.slug}`} className="hover:text-brand">
                  {lead.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-prose leading-8 text-ink/80">{lead.excerpt}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="flex gap-4 text-sm text-ink/75">
                  <span>{lead.date}</span>
                  <span>مطالعه {lead.readMinutes.toLocaleString("fa-IR")} دقیقه</span>
                </p>
                <Link
                  href={`/articles/${lead.slug}`}
                  className="btn-action rounded-xl px-6 py-2.5 text-sm font-bold"
                >
                  خواندن مقاله
                </Link>
              </div>
            </article>

            {rest.length > 0 && (
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {rest.map((a) => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-line bg-white px-6 py-14 text-center">
            <h2 className="text-lg font-bold">مقاله‌ای در این دسته پیدا نشد</h2>
            <Link
              href="/articles"
              className="mt-5 inline-flex rounded-full border border-line px-5 py-2 text-sm font-medium hover:bg-brand-soft"
            >
              نمایش همه مقالات
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-line bg-brand-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">سؤال فنی دارید؟</h2>
            <p className="mt-1 text-sm text-ink/75">
              موضوعی که دوست دارید درباره‌اش بنویسیم یا گریدی که درباره‌اش مطمئن نیستید را بپرسید.
            </p>
          </div>
          <Link href="/contact" className="btn-action rounded-xl px-6 py-3 text-sm font-bold">
            پرسش از کارشناس
          </Link>
        </div>
      </section>
    </>
  );
}
