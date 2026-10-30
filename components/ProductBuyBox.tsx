"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

type Props = {
  slug: string; // شناسه محصول برای افزودن به سبد
  price: number; // تومان به ازای هر واحد
  unit: string; // مثلاً «کیلوگرم»
  packSize: number; // وزن هر بسته به واحد محصول
  packLabel: string; // مثلاً «کیسه ۲۵ کیلوگرمی»
  stockStatus?: "available" | "out_of_stock" | "contact";
  stockQuantity?: number;
};

const fa = (n: number) => n.toLocaleString("fa-IR");

export default function ProductBuyBox({ slug, price, unit, packSize, packLabel, stockStatus = "available", stockQuantity }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const totalAmount = qty * packSize;
  const totalPrice = totalAmount * price;
  const canBuy = stockStatus === "available" && (stockQuantity === undefined || stockQuantity > 0);

  const update = (n: number) => {
    setQty(Math.min(999, Math.max(1, Math.floor(n) || 1)));
    setAdded(false);
  };

  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_8px_24px_-16px_rgba(6,48,58,.5)] md:p-6">
      <p className="whitespace-nowrap">
        <span className="text-3xl font-bold">{fa(price)}</span>{" "}
        <span className="text-sm text-ink/70">تومان / {unit}</span>
      </p>

      <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${stockStatus === "contact" ? "bg-amber-50 text-amber-800" : canBuy ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
        {stockStatus === "contact" ? "برای استعلام موجودی و قیمت تماس بگیرید." : canBuy ? `موجود${stockQuantity !== undefined ? ` · ${fa(stockQuantity)} واحد در انبار` : ""}` : "این محصول در حال حاضر ناموجود است."}
      </div>

      {canBuy && <div className="mt-5 flex items-center justify-between gap-4">
        <label htmlFor="qty" className="text-sm font-medium">
          تعداد بسته
          <span className="block text-xs font-normal text-ink/70">{packLabel}</span>
        </label>

        <div dir="ltr" className="flex h-11 items-center rounded-xl border border-line bg-paper">
          <button
            type="button"
            onClick={() => update(qty - 1)}
            disabled={qty <= 1}
            aria-label="کم کردن تعداد"
            className="flex h-full w-11 items-center justify-center rounded-s-xl text-lg hover:bg-brand-soft disabled:opacity-40 disabled:hover:bg-transparent"
          >
            −
          </button>
          <input
            id="qty"
            type="number"
            inputMode="numeric"
            min={1}
            max={999}
            value={qty}
            onChange={(e) => update(Number(e.target.value))}
            className="h-full w-14 border-x border-line bg-white text-center text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => update(qty + 1)}
            aria-label="زیاد کردن تعداد"
            className="flex h-full w-11 items-center justify-center rounded-e-xl text-lg hover:bg-brand-soft"
          >
            +
          </button>
        </div>
      </div>}

      {canBuy && <dl aria-live="polite" className="mt-5 divide-y divide-line rounded-xl bg-paper px-4 text-sm">
        <div className="flex items-center justify-between py-3">
          <dt className="text-ink/75">مقدار کل</dt>
          <dd className="font-medium">
            {fa(totalAmount)} {unit}
          </dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-ink/75">مبلغ تقریبی</dt>
          <dd className="whitespace-nowrap text-lg font-bold">
            {fa(totalPrice)} <span className="text-xs font-normal text-ink/70">تومان</span>
          </dd>
        </div>
      </dl>}

      {stockStatus === "contact" ? <Link href="/contact" className="btn-action mt-5 flex w-full items-center justify-center rounded-xl px-4 py-3.5 font-bold">تماس برای استعلام</Link> : canBuy ? <button
        type="button"
        onClick={() => {
          add(slug, qty);
          setAdded(true);
        }}
        className="btn-action mt-5 flex w-full items-center justify-center rounded-xl px-4 py-3.5 font-bold"
      >
        افزودن به سبد خرید
      </button> : <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-xl bg-paper px-4 py-3.5 font-bold text-ink/45">ناموجود</button>}

      {added && (
        <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-900">
          {fa(qty)} بسته به سبد خرید اضافه شد.{" "}
          <Link href="/cart" className="font-bold underline">
            مشاهده سبد خرید
          </Link>
        </p>
      )}

      <Link
        href="/dashboard/proforma"
        className="mt-3 flex w-full items-center justify-center whitespace-nowrap rounded-xl border border-brand px-4 py-3 text-sm font-medium text-brand hover:bg-brand-soft"
      >
        درخواست پیش‌فاکتور
      </Link>

      <p className="mt-4 text-xs leading-6 text-ink/70">
        مبلغ نهایی و موجودی در پیش‌فاکتور رسمی تأیید می‌شود.
      </p>
    </div>
  );
}
