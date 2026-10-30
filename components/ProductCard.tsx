import Image from "next/image";
import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { localImage } from "@/lib/images";
import type { Product } from "@/lib/data";

export default function ProductCard({ product: p }: { product: Product }) {
  const href = `/products/${p.slug}`;
  const photo = p.imageUrl?.trim() || localImage("products", p.slug);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)] transition-shadow hover:shadow-[0_14px_30px_-14px_rgba(6,48,58,.55)]">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block">
        {photo ? (
          <div className="relative h-44">
            {p.imageUrl?.trim() ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Image src={photo} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />}
          </div>
        ) : (
          <ProductVisual kind={p.badge} />
        )}
        <span
          dir="ltr"
          className="absolute start-3 top-3 rounded-sm bg-ink px-2 py-0.5 text-xs font-bold text-white"
        >
          {p.badge}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-7">
          <Link href={href} className="hover:text-brand">
            {p.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink/75">{p.summary}</p>

        <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
          {p.specs.map((s) => (
            <div key={s.label} className="flex justify-between gap-3 py-2">
              <dt className="whitespace-nowrap text-ink/70">{s.label}</dt>
              <dd className="text-end font-medium"><bdi>{s.value}</bdi></dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto pt-5">
          <p className={`mb-2 text-xs font-bold ${p.stockStatus === "contact" ? "text-amber-700" : p.stockStatus === "out_of_stock" || (p.stockStatus === "available" && p.stockQuantity === 0) ? "text-rose-700" : "text-emerald-700"}`}>
            {p.stockStatus === "contact" ? "تماس بگیرید" : p.stockStatus === "out_of_stock" || (p.stockStatus === "available" && p.stockQuantity === 0) ? "ناموجود" : p.stockQuantity !== undefined ? `موجود · ${p.stockQuantity.toLocaleString("fa-IR")} واحد` : "قابل سفارش"}
          </p>
          <p className="whitespace-nowrap">
            <span className="text-lg font-bold">
              {p.price.toLocaleString("fa-IR")}
            </span>{" "}
            <span className="text-xs text-ink/70">تومان / {p.unit}</span>
          </p>
          <Link
            href={href}
            className="btn-action mt-3 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold"
          >
            مشاهده و خرید
          </Link>
        </div>
      </div>
    </article>
  );
}
