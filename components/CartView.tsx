"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { products } from "@/lib/data";
import { productDetails } from "@/lib/product-details";

const fa = (n: number) => n.toLocaleString("fa-IR");

export default function CartView() {
  const { lines, ready, setQty, remove, clear } = useCart();

  const rows = lines.flatMap((l) => {
    const p = products.find((x) => x.slug === l.slug);
    if (!p) return [];
    const pack = productDetails[p.slug]?.pack ?? { size: 1, label: p.unit };
    const amount = l.qty * pack.size;
    return [{ p, pack, qty: l.qty, amount, total: amount * p.price }];
  });

  const totalPrice = rows.reduce((s, r) => s + r.total, 0);
  const totalPacks = rows.reduce((s, r) => s + r.qty, 0);

  if (!ready) {
    return (
      <div aria-hidden="true" className="mx-auto grid max-w-6xl animate-pulse gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
        <div className="h-64 rounded-2xl bg-brand-soft" />
        <div className="h-64 rounded-2xl bg-brand-soft" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mx-auto text-brand">
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="18" cy="20" r="1.5" />
            <path d="M3 4h2l2.4 11h11l2-8H6.5" />
          </svg>
          <h2 className="mt-4 text-lg font-bold">سبد خرید شما خالی است</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-ink/75">
            گرید موردنظرتان را از فهرست محصولات انتخاب کنید و مقدار آن را به سبد اضافه کنید. اگر
            مطمئن نیستید کدام گرید مناسب است، با کارشناسان ما مشورت کنید.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className="btn-action rounded-xl px-6 py-3 text-sm font-bold">
              مشاهده محصولات
            </Link>
            <Link href="/contact" className="rounded-full border border-line px-5 py-2.5 text-sm font-medium hover:bg-brand-soft">
              درخواست مشاوره
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px] lg:gap-10 lg:py-14">
      <section aria-label="اقلام سبد خرید">
        <ul className="space-y-4">
          {rows.map(({ p, pack, qty, amount, total }) => (
            <li
              key={p.slug}
              className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)]"
            >
              <div className="flex items-start gap-4">
                <span
                  dir="ltr"
                  className="mt-1 shrink-0 rounded-sm bg-ink px-2 py-0.5 text-xs font-bold text-white"
                >
                  {p.badge}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold leading-7">
                    <Link href={`/products/${p.slug}`} className="hover:text-brand">
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-ink/70">
                    {pack.label} · {fa(p.price)} تومان / {p.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.slug)}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-ink/70 hover:bg-brand-soft hover:text-ink"
                >
                  حذف
                  <span className="sr-only"> {p.name} از سبد</span>
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
                <div dir="ltr" className="flex h-10 items-center rounded-xl border border-line bg-paper">
                  <button
                    type="button"
                    onClick={() => setQty(p.slug, qty - 1)}
                    disabled={qty <= 1}
                    aria-label="کم کردن تعداد"
                    className="flex h-full w-10 items-center justify-center rounded-s-xl text-lg hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={999}
                    value={qty}
                    aria-label={`تعداد بسته ${p.name}`}
                    onChange={(e) => setQty(p.slug, Number(e.target.value))}
                    className="h-full w-14 border-x border-line bg-white text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(p.slug, qty + 1)}
                    aria-label="زیاد کردن تعداد"
                    className="flex h-full w-10 items-center justify-center rounded-e-xl text-lg hover:bg-brand-soft"
                  >
                    +
                  </button>
                </div>

                <div className="text-end text-sm">
                  <p className="text-ink/70">
                    {fa(amount)} {p.unit}
                  </p>
                  <p className="mt-0.5 whitespace-nowrap text-lg font-bold">
                    {fa(total)} <span className="text-xs font-normal text-ink/70">تومان</span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/products" className="font-medium text-brand hover:underline">
            ادامه خرید و افزودن محصول
          </Link>
          <button
            type="button"
            onClick={clear}
            className="rounded-md px-2 py-1 text-ink/70 hover:bg-brand-soft hover:text-ink"
          >
            خالی کردن سبد
          </button>
        </div>
      </section>

      <aside aria-label="خلاصه سفارش" className="self-start lg:sticky lg:top-[132px]">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)] md:p-6">
          <h2 className="border-s-4 border-action ps-3 text-lg font-bold">خلاصه سفارش</h2>
          <dl aria-live="polite" className="mt-5 divide-y divide-line rounded-xl bg-paper px-4 text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="text-ink/75">تعداد اقلام</dt>
              <dd className="font-medium">{fa(rows.length)} محصول</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-ink/75">مجموع بسته‌ها</dt>
              <dd className="font-medium">{fa(totalPacks)} بسته</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-ink/75">مبلغ تقریبی</dt>
              <dd className="whitespace-nowrap text-lg font-bold">
                {fa(totalPrice)} <span className="text-xs font-normal text-ink/70">تومان</span>
              </dd>
            </div>
          </dl>

          <Link
            href="/dashboard/proforma"
            className="btn-action mt-5 flex w-full items-center justify-center rounded-xl px-4 py-3.5 font-bold"
          >
            ثبت درخواست پیش‌فاکتور
          </Link>
          <Link
            href="/contact"
            className="mt-3 flex w-full items-center justify-center whitespace-nowrap rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand hover:bg-brand-soft"
          >
            مشاوره با کارشناس
          </Link>

          <p className="mt-4 text-xs leading-6 text-ink/70">
            هزینه حمل، مالیات و موجودی در پیش‌فاکتور رسمی تأیید می‌شود. پرداخت پس از تأیید
            پیش‌فاکتور انجام می‌شود.
          </p>
        </div>
      </aside>
    </div>
  );
}
