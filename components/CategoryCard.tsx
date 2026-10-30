import Image from "next/image";
import Link from "next/link";
import ProductVisual from "./ProductVisual";
import { localImage } from "@/lib/images";
import type { Family } from "@/lib/data";

// تصویر گرافیکی موقت تا زمانی که عکس واقعی دسته‌بندی اضافه شود
const FALLBACK: Record<string, string> = {
  polyethylene: "HDPE",
  polypropylene: "PP",
  epoxy: "EP",
  pvc: "PVC",
  polyester: "EP",
  additives: "PP",
};

export default function CategoryCard({ family: f }: { family: Family }) {
  const photo = localImage("categories", f.slug);

  return (
    <Link
      href={`/products?category=${f.slug}`}
      className="group relative block overflow-hidden rounded-xl bg-ink"
    >
      <div className="relative h-60 bg-brand-soft">
        {photo ? (
          <Image
            src={photo}
            alt={f.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductVisual kind={FALLBACK[f.slug] ?? "HDPE"} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="text-lg font-bold">{f.name}</h3>
        <p className="mt-1 text-sm text-white/80">{f.uses}</p>
      </div>
    </Link>
  );
}
