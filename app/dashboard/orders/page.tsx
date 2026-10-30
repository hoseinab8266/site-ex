'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, StatusBadge, Table } from "@/components/panel/ui";
import type { Order } from "@/lib/panel-data";

type Row = Pick<Order, "id" | "date" | "item" | "qty" | "total" | "status">;

export default function BuyerOrders() {
  const [orders, setOrders] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || "دریافت سفارش‌ها انجام نشد.");
        if (alive) setOrders(body?.orders ?? []);
      } catch (err) {
        if (alive) {
          setOrders([]);
          setError(err instanceof Error ? err.message : "دریافت سفارش‌ها انجام نشد.");
        }
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <PageTitle title="سفارش‌های من" hint="وضعیت همه سفارش‌های ثبت‌شده" />

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-900">{error}</p>
      )}

      {orders === null ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">در حال دریافت سفارش‌ها…</p>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-line bg-white px-6 py-10 text-center">
          <p className="text-sm leading-8 text-ink/70">هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/products" className="btn-action mt-5 inline-flex rounded-xl px-6 py-3 text-sm font-bold">مشاهده محصولات</Link>
        </div>
      ) : (
        <Table
          head={["شماره", "تاریخ", "محصول", "مقدار", "مبلغ (تومان)", "وضعیت"]}
          rows={orders.map((o) => [
            <bdi key="i" className="font-medium">{o.id}</bdi>,
            o.date,
            o.item,
            o.qty,
            o.total.toLocaleString("fa-IR"),
            <StatusBadge key="s" status={o.status} />,
          ])}
        />
      )}
    </>
  );
}
