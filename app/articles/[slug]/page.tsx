import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ArticleCard from "@/components/ArticleCard";
import { getCatalog } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";
import { articleBodies } from "@/lib/article-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { articles } = await getCatalog();
  const a = articles.find((x) => x.slug === slug && x.published !== false);
  if (!a) return {};
  return { title: a.title, description: a.excerpt };
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ink/50">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default function ArticlePage({ params }: Props) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ArticleContent params={params} />
    </Suspense>
  );
}

function ArticleSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-3xl animate-pulse space-y-4 px-4 py-10">
      <div className="h-4 w-32 rounded bg-brand-soft" />
      <div className="h-10 w-full rounded bg-brand-soft" />
      <div className="h-64 rounded-xl bg-brand-soft" />
    </div>
  );
}

async function ArticleContent({ params }: Props) {
  const { slug } = await params;
  const { articles } = await getCatalog();
  const a = articles.find((x) => x.slug === slug && x.published !== false);
  if (!a) notFound();

  const body = articleBodies[a.slug];
  const customParagraphs = (a.body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 2);

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <nav aria-label="مسیر صفحه" className="mb-5">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/70">
              <li><Link href="/" className="hover:text-brand">خانه</Link></li>
              <li aria-hidden="true"><Chevron /></li>
              <li><Link href="/articles" className="hover:text-brand">مقالات علمی</Link></li>
            </ol>
          </nav>
          <Link
            href={`/articles?category=${encodeURIComponent(a.category)}`}
            className="text-sm font-medium text-brand hover:underline"
          >
            {a.category}
          </Link>
          <h1 className="mt-2 border-s-4 border-action ps-3 text-2xl font-bold leading-[1.9] md:text-3xl md:leading-[1.9]">
            {a.title}
          </h1>
          <p className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink/75">
            <span>{a.date}</span>
            <span>مطالعه {a.readMinutes.toLocaleString("fa-IR")} دقیقه</span>
            <span>تیم فنی پلیرز</span>
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
        <article>
          <p className="text-lg leading-9 text-ink/85">{customParagraphs.length ? customParagraphs[0] : body?.intro ?? a.excerpt}</p>

          {customParagraphs.length > 1 ? customParagraphs.slice(1).map((paragraph, i) => <p key={i} className="mt-5 leading-9 text-ink/85">{paragraph}</p>) : body?.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-xl font-bold leading-9 md:text-2xl">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-9 text-ink/85">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="mt-4 space-y-3 rounded-xl border border-line bg-white p-5">
                  {s.list.map((item) => (
                    <li key={item} className="flex items-start gap-3 leading-8">
                      <span aria-hidden="true" className="mt-3 h-2 w-2 shrink-0 rounded-full bg-action" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {body && customParagraphs.length === 0 && (
            <aside className="mt-12 rounded-2xl bg-brand-soft p-6 md:p-8">
              <h2 className="border-s-4 border-action ps-3 text-lg font-bold">جمع‌بندی</h2>
              <p className="mt-3 leading-8 text-ink/85">{body.takeaway}</p>
            </aside>
          )}
        </article>

        <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-brand px-6 py-8 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold">گرید مناسب کارتان را می‌خواهید؟</h2>
            <p className="mt-1 text-sm leading-7 text-white/85">
              محصولات را با مشخصات فنی ببینید یا از کارشناسان ما کمک بگیرید.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/products" className="btn-action rounded-xl px-6 py-3 text-sm font-bold">
              مشاهده محصولات
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center whitespace-nowrap rounded-xl border border-white/40 px-6 py-3 text-sm font-medium hover:bg-white/10"
            >
              مشاوره
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
            <h2 className="border-s-4 border-action ps-3 text-xl font-bold md:text-2xl">مقالات مرتبط</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {related.map((r) => (
                <ArticleCard key={r.slug} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
