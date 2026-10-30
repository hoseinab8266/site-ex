import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductFilters, {
  buildProductsHref,
  sortOptions,
} from "@/components/products/ProductFilters";
import { families } from "@/lib/data";
import { getCatalog } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "محصولات",
  description:
    "فهرست مواد پلیمری و رزین‌های صنعتی پلیرز با مشخصات فنی، قیمت و امکان صدور پیش‌فاکتور.",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// محصولات فعلاً فیلد دسته‌بندی ندارند؛ از روی badge به خانواده وصل می‌شوند.
const badgeToFamily: Record<string, string> = {
  HDPE: "polyethylene",
  PP: "polypropylene",
  EP: "epoxy",
  PVC: "pvc",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// یکسان‌سازی ارقام فارسی/عربی و حروف ی و ک برای جستجو
function norm(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .toLowerCase();
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ink/50">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default function ProductsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

function ProductsSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-6xl animate-pulse gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <div className="h-80 rounded-xl bg-brand-soft" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-96 rounded-xl bg-brand-soft" />
        ))}
      </div>
    </div>
  );
}

async function ProductsContent({ searchParams }: Props) {
  const catalog = await getCatalog();
  const products = catalog.products;
  const sp = await searchParams;
  const q = first(sp.q).trim();
  const sortRaw = first(sp.sort);
  const sort = sortOptions.some((o) => o.value === sortRaw) ? sortRaw : "default";
  const categoryRaw = first(sp.category);
  const activeFamily = families.find((f) => f.slug === categoryRaw);
  const category = activeFamily?.slug ?? "";

  const matchesQuery = (p: (typeof products)[number]) => {
    if (!q) return true;
    const hay = norm(
      [p.name, p.summary, p.badge, ...p.specs.map((s) => `${s.label} ${s.value}`)].join(" ")
    );
    return norm(q)
      .split(/\s+/)
      .every((word) => hay.includes(word));
  };

  const inQuery = products.filter(matchesQuery);

  const categories = families.map((f) => ({
    slug: f.slug,
    name: f.name,
    count: inQuery.filter((p) => badgeToFamily[p.badge] === f.slug).length,
  }));

  const list = inQuery
    .filter((p) => !category || badgeToFamily[p.badge] === category)
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : 0
    );

  const chip =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white px-3 py-1 text-xs hover:bg-brand-soft";

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <nav aria-label="مسیر صفحه" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-ink/70">
              <li>
                <Link href="/" className="hover:text-brand">
                  خانه
                </Link>
              </li>
              <li aria-hidden="true">
                <Chevron />
              </li>
              <li aria-current="page" className="font-medium text-ink">
                محصولات
              </li>
            </ol>
          </nav>
          <h1 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">
            {activeFamily ? activeFamily.name : "محصولات"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/75">
            {activeFamily
              ? activeFamily.uses
              : "مواد پلیمری و رزین‌های صنعتی با مشخصات فنی روشن. برای هر گرید می‌توانید برگه فنی ببینید و پیش‌فاکتور رسمی بگیرید."}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr] lg:gap-10 lg:py-14">
        <ProductFilters
          categories={categories}
          total={inQuery.length}
          category={category}
          q={q}
          sort={sort}
        />

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink/75" aria-live="polite">
              <span className="font-bold text-ink">{list.length.toLocaleString("fa-IR")}</span> محصول
              یافت شد
            </p>
            {(q || category) && (
              <ul className="flex flex-wrap items-center gap-2">
                {q && (
                  <li>
                    <Link href={buildProductsHref({ category, sort })} className={chip}>
                      <span>
                        جستجو: <bdi>{q}</bdi>
                      </span>
                      <span aria-hidden="true">×</span>
                      <span className="sr-only">حذف جستجو</span>
                    </Link>
                  </li>
                )}
                {activeFamily && (
                  <li>
                    <Link href={buildProductsHref({ q, sort })} className={chip}>
                      <span>{activeFamily.name}</span>
                      <span aria-hidden="true">×</span>
                      <span className="sr-only">حذف فیلتر دسته‌بندی</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/products" className="text-xs font-medium text-brand hover:underline">
                    پاک کردن همه
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {list.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-white px-6 py-14 text-center">
              <h2 className="text-lg font-bold">محصولی با این مشخصات پیدا نشد</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink/75">
                عبارت جستجو یا دسته‌بندی را تغییر دهید. اگر گرید خاصی نیاز دارید، کارشناسان ما
                در تأمین آن کمک می‌کنند.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/products"
                  className="rounded-full border border-line px-5 py-2 text-sm font-medium hover:bg-brand-soft"
                >
                  نمایش همه محصولات
                </Link>
                <Link
                  href="/contact"
                  className="btn-action rounded-xl px-5 py-2.5 text-sm font-bold"
                >
                  درخواست مشاوره
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-brand-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold">گرید مناسب را پیدا نکردید؟</h2>
            <p className="mt-1 text-sm text-ink/75">
              مشخصات مورد نیازتان را بگویید تا گرید جایگزین پیشنهاد دهیم.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-action rounded-xl px-6 py-3 text-sm font-bold"
          >
            تماس با کارشناس
          </Link>
        </div>
      </section>
    </>
  );
}
