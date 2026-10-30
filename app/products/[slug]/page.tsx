import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductBuyBox from "@/components/ProductBuyBox";
import ProductCard from "@/components/ProductCard";
import ProductVisual from "@/components/ProductVisual";
import { families } from "@/lib/data";
import { getCatalog } from "@/lib/catalog-store";
export const dynamic = "force-dynamic";
import { localImage } from "@/lib/images";
import { productDetails } from "@/lib/product-details";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { products } = await getCatalog();
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: p.summary };
}

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ink/50">
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-s-4 border-action ps-3 text-xl font-bold md:text-2xl">{children}</h2>;
}

const trust = ["برگه فنی هر گرید", "مشاوره پیش از خرید", "صدور پیش‌فاکتور رسمی"];

// params داده زمان درخواست است؛ پوسته صفحه فوری نمایش داده می‌شود و محتوا داخل Suspense می‌آید.
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid max-w-6xl animate-pulse gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-12">
      <div className="h-80 rounded-2xl bg-brand-soft md:h-[30rem]" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-brand-soft" />
        <div className="h-8 w-3/4 rounded bg-brand-soft" />
        <div className="h-4 w-full rounded bg-brand-soft" />
        <div className="h-72 rounded-2xl bg-brand-soft" />
      </div>
    </div>
  );
}

async function ProductContent({ params }: Props) {
  const { slug } = await params;
  const { products } = await getCatalog();
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();

  const d = productDetails[p.slug];
  const family = families.find((f) => f.slug === (p.family || d?.family));
  const photo = p.imageUrl?.trim() || localImage("products", p.slug);
  const pack = { size: p.packSize ?? d?.pack.size ?? 1, label: p.packLabel || d?.pack.label || p.unit };
  const description = p.description?.length ? p.description : d?.description ?? [];
  const applications = p.applications?.length ? p.applications : d?.applications ?? [];
  const storage = p.storage || d?.storage || "";
  const allSpecs = [...p.specs, ...(p.extraSpecs ?? d?.extraSpecs ?? [])];
  const related = products.filter((x) => x.slug !== p.slug).slice(0, 3);

  return (
    <>
      {/* مسیر صفحه */}
      <nav aria-label="مسیر صفحه" className="mx-auto max-w-6xl px-4 pt-5 text-sm text-ink/75">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-brand">خانه</Link></li>
          <li aria-hidden="true"><Chevron /></li>
          <li><Link href="/products" className="hover:text-brand">محصولات</Link></li>
          {family && (
            <>
              <li aria-hidden="true"><Chevron /></li>
              <li><Link href={`/products?category=${family.slug}`} className="hover:text-brand">{family.name}</Link></li>
            </>
          )}
        </ol>
      </nav>

      {/* بخش اصلی: تصویر و خرید */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-14 pt-6 md:pb-20 lg:grid-cols-2 lg:gap-12">
        <figure className="self-start overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)]">
          <div className="relative">
            {photo ? (
              <div className="relative h-72 md:h-[26rem]">
                <Image
                  src={photo}
                  alt={p.name}
                  fill
                  priority
                  unoptimized={Boolean(p.imageUrl?.trim())}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="[&_svg]:h-72 md:[&_svg]:h-[26rem]">
                <ProductVisual kind={p.badge} />
              </div>
            )}
            <span
              dir="ltr"
              className="absolute start-4 top-4 rounded-sm bg-ink px-2.5 py-1 text-xs font-bold text-white"
            >
              {p.badge}
            </span>
          </div>

          {/* پلاک فنی: سه مشخصه کلیدی کنار تصویر */}
          <dl className="grid grid-cols-3 divide-x divide-line border-t border-line bg-paper text-sm">
            {p.specs.map((s) => (
              <div key={s.label} className="px-3 py-3.5 text-center">
                <dt className="text-xs text-ink/70">{s.label}</dt>
                <dd className="mt-1 font-bold"><bdi>{s.value}</bdi></dd>
              </div>
            ))}
          </dl>
        </figure>

        <div>
          {family && (
            <Link href={`/products?category=${family.slug}`} className="text-sm font-medium text-brand hover:underline">
              {family.name}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold leading-[1.8] md:text-3xl md:leading-[1.8]">{p.name}</h1>
          <p className="mt-3 max-w-prose leading-8 text-ink/80">{p.summary}</p>

          <div className="mt-6">
            <ProductBuyBox slug={p.slug} price={p.price} unit={p.unit} packSize={pack.size} packLabel={pack.label} stockStatus={p.stockStatus} stockQuantity={p.stockQuantity} />
          </div>

          <ul className="mt-6 grid gap-3 text-sm font-medium sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {trust.map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* توضیحات و مشخصات فنی */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:py-20 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {(description.length > 0 || applications.length > 0 || storage) && (
              <>
                <SectionTitle>درباره این گرید</SectionTitle>
                {description.length > 0 && <div className="mt-5 max-w-prose space-y-4 leading-8 text-ink/85">
                  {description.map((para, i) => <p key={`${i}-${para}`}>{para}</p>)}
                </div>}

                {applications.length > 0 && <><h3 className="mt-10 font-bold">کاربردها</h3>
                <ul className="mt-3 divide-y divide-line border-y border-line">
                  {applications.map((a) => <li key={a} className="flex items-center gap-2 py-3 text-sm"><Check />{a}</li>)}
                </ul></>}

                {(pack.label || storage) && <><h3 className="mt-10 font-bold">بسته‌بندی و نگهداری</h3>
                <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
                  {pack.label && <div className="flex justify-between gap-4 py-3"><dt className="whitespace-nowrap text-ink/70">بسته‌بندی</dt><dd className="text-end font-medium">{pack.label}</dd></div>}
                  {storage && <div className="flex justify-between gap-4 py-3"><dt className="whitespace-nowrap text-ink/70">نگهداری</dt><dd className="max-w-md text-end leading-7">{storage}</dd></div>}
                </dl></>}
              </>
            )}
          </div>

          <div className="lg:col-span-2">
            <SectionTitle>مشخصات فنی</SectionTitle>
            <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">
              {allSpecs.map((s, i) => (
                <div key={s.label} className={`flex justify-between gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-paper" : "bg-white"}`}>
                  <dt className="whitespace-nowrap text-ink/70">{s.label}</dt>
                  <dd className="text-end font-medium"><bdi>{s.value}</bdi></dd>
                </div>
              ))}
            </dl>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-brand hover:underline"
            >
              درخواست برگه فنی کامل
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* محصولات مرتبط */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <SectionTitle>محصولات دیگر</SectionTitle>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => (
            <ProductCard key={r.slug} product={r} />
          ))}
        </div>
      </section>

      {/* فراخوان مشاوره */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-24">
        <div className="flex flex-col gap-6 rounded-2xl bg-brand px-6 py-10 text-white md:flex-row md:items-center md:justify-between md:px-12">
          <div>
            <h2 className="text-2xl font-bold">مطمئن نیستید این گرید مناسب کار شماست؟</h2>
            <p className="mt-2 max-w-xl leading-8 text-white/85">
              کاربرد و مقدار موردنیازتان را بنویسید؛ تیم فنی پلیرز گرید مناسب را پیشنهاد می‌دهد.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-action inline-flex shrink-0 items-center justify-center rounded-xl px-7 py-3.5 font-bold"
          >
            درخواست مشاوره
          </Link>
        </div>
      </section>
    </>
  );
}
