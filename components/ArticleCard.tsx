import Link from "next/link";
import type { Article } from "@/lib/data";

export default function ArticleCard({ article: a }: { article: Article }) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-white p-6 shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)] transition-shadow hover:shadow-[0_14px_30px_-14px_rgba(6,48,58,.55)]">
      <p className="text-sm font-medium text-brand">{a.category}</p>
      <h2 className="mt-2 text-lg font-bold leading-8">
        <Link href={`/articles/${a.slug}`} className="hover:text-brand">
          {a.title}
        </Link>
      </h2>
      <p className="mt-3 text-sm leading-7 text-ink/75">{a.excerpt}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm text-ink/70">
        <p className="flex gap-4">
          <span>{a.date}</span>
          <span>مطالعه {a.readMinutes.toLocaleString("fa-IR")} دقیقه</span>
        </p>
        <Link
          href={`/articles/${a.slug}`}
          aria-label={`ادامه مطلب: ${a.title}`}
          className="whitespace-nowrap font-medium text-brand hover:underline"
        >
          ادامه مطلب
        </Link>
      </div>
    </article>
  );
}
