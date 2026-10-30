"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge, inputCls } from "@/components/panel/ui";
import { digits, faDigits } from "@/lib/fa";
import type { Status } from "@/lib/panel-data";

type Tracked = {
  id: string;
  date: string;
  item: string;
  qty: string;
  total: number;
  status: Status;
  statusLabel: string;
};

export default function OrdersPage() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [order, setOrder] = useState<Tracked | null>(null);
  const [note, setNote] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = String(new FormData(e.currentTarget).get("id") ?? "").trim();
    const id = digits(raw);
    if (!id) {
      setNote("شمارهٔ سفارش را وارد کنید.");
      setState("error");
      return;
    }

    setState("loading");
    setNote("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "سفارشی با این شماره پیدا نشد.");
      setOrder(body.order as Tracked);
      setState("done");
    } catch (err) {
      setState("error");
      setNote(err instanceof Error ? err.message : "رهگیری سفارش انجام نشد.");
    }
  }

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 25% 50%, rgba(11,107,120,.7), transparent 62%), linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
            backgroundSize: "auto, 48px 48px, 48px 48px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <h1 className="text-3xl font-bold leading-[1.8] md:text-4xl">پیگیری سفارش</h1>
          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            شمارهٔ سفارش خود را وارد کنید تا وضعیت و اقلام آن را ببینید.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-line bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block text-sm font-medium">
            شمارهٔ سفارش
            <input
              name="id"
              required
              placeholder="مثلاً PR-۱۰۴۸"
              className={`${inputCls} mt-1.5`}
            />
          </label>
          <button
            type="submit"
            disabled={state === "loading"}
            className="btn-action h-11 rounded-lg px-7 text-sm font-bold disabled:opacity-60"
          >
            {state === "loading" ? "در حال جست‌وجو…" : "رهگیری"}
          </button>
        </form>

        {state === "error" && (
          <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {note}
          </p>
        )}

        {state === "done" && order && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <bdi dir="ltr" className="text-lg font-bold">{order.id}</bdi>
              <StatusBadge status={order.status} />
            </div>
            <dl className="mt-5 divide-y divide-line text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/70">تاریخ ثبت</dt>
                <dd className="font-medium">{order.date}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/70">محصول</dt>
                <dd className="text-end font-medium">{order.item}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/70">مقدار</dt>
                <dd className="font-medium">{order.qty}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-ink/70">مبلغ (تومان)</dt>
                <dd className="font-medium">{faDigits(order.total.toLocaleString("en-US"))}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs leading-6 text-ink/60">
              برای پیگیری دقیق‌تر یا تغییر سفارش با{" "}
              <Link href="/contact" className="text-brand underline">پشتیبانی</Link> تماس بگیرید.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
