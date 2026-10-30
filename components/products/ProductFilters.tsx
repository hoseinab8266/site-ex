import Link from "next/link";

export type CategoryItem = { slug: string; name: string; count: number };

export const sortOptions = [
  { value: "default", label: "پیش‌فرض" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
] as const;

type Query = { category?: string; q?: string; sort?: string };

// ساخت آدرس /products با پارامترهای فعال (مقدارهای خالی یا پیش‌فرض حذف می‌شوند)
export function buildProductsHref({ category, q, sort }: Query) {
  const sp = new URLSearchParams();
  if (category) sp.set("category", category);
  if (q) sp.set("q", q);
  if (sort && sort !== "default") sp.set("sort", sort);
  const s = sp.toString();
  return s ? `/products?${s}` : "/products";
}

type Props = {
  categories: CategoryItem[];
  total: number;
  category: string;
  q: string;
  sort: string;
};

export default function ProductFilters({ categories, total, category, q, sort }: Props) {
  const itemBase =
    "flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-sm transition-colors";
  const itemOn = "border-ink bg-ink font-bold text-white";
  const itemOff = "border-line bg-white hover:bg-brand-soft";

  return (
    <aside aria-label="فیلتر محصولات" className="space-y-7 lg:sticky lg:top-28 lg:self-start">
      <form action="/products" role="search" className="space-y-3">
        {category && <input type="hidden" name="category" value={category} />}

        <div>
          <label htmlFor="products-q" className="mb-1.5 block text-sm font-bold">
            جستجو
          </label>
          <input
            id="products-q"
            type="search"
            name="q"
            defaultValue={q}
            placeholder="گرید یا نام محصول، مثلاً PP"
            className="h-10 w-full rounded-full border border-line bg-white px-4 text-sm outline-none focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="products-sort" className="mb-1.5 block text-sm font-bold">
            مرتب‌سازی
          </label>
          <select
            id="products-sort"
            name="sort"
            defaultValue={sort}
            className="h-10 w-full rounded-full border border-line bg-white px-3 text-sm outline-none focus:border-brand"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-10 w-full rounded-full bg-ink text-sm font-medium text-white hover:bg-brand"
        >
          اعمال
        </button>
      </form>

      <nav aria-label="دسته‌بندی محصولات">
        <h2 className="mb-2.5 text-sm font-bold">دسته‌بندی</h2>
        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          <li className="lg:w-full">
            <Link
              href={buildProductsHref({ q, sort })}
              aria-current={!category ? "page" : undefined}
              className={`${itemBase} ${!category ? itemOn : itemOff}`}
            >
              <span>همه محصولات</span>
              <span className="text-xs opacity-80">{total.toLocaleString("fa-IR")}</span>
            </Link>
          </li>
          {categories.map((c) => {
            const on = category === c.slug;
            return (
              <li key={c.slug} className="lg:w-full">
                <Link
                  href={buildProductsHref({ category: c.slug, q, sort })}
                  aria-current={on ? "page" : undefined}
                  className={`${itemBase} ${on ? itemOn : itemOff}`}
                >
                  <span>{c.name}</span>
                  <span className="text-xs opacity-80">{c.count.toLocaleString("fa-IR")}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
