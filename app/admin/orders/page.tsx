'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageTitle, StatusBadge, Table } from "@/components/panel/ui";
import { statusLabel, type Status, type Order } from "@/lib/panel-data";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "دریافت سفارش‌ها انجام نشد.");
      setOrders(body?.orders ?? []);
      setError(null);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "دریافت سفارش‌ها انجام نشد.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(orderId: string, newStatus: Status) {
    setBusyId(orderId);
    setError(null);
    // به‌روزرسانی خوش‌بینانه، سپس تأیید سرور
    setOrders((prev) => prev?.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)) ?? prev);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "تغییر وضعیت انجام نشد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت انجام نشد.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageTitle title="سفارش‌ها" hint="مدیریت و تغییر وضعیت سفارش‌ها" />

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-900">{error}</p>
      )}

      {orders === null ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">در حال دریافت سفارش‌ها…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">سفارشی ثبت نشده است.</p>
      ) : (
        <Table
          head={["شماره", "مشتری", "محصول", "مبلغ (تومان)", "وضعیت", "اقدام"]}
          rows={orders.map((o) => [
            <bdi key="i" className="font-medium">{o.id}</bdi>,
            o.customer,
            o.item,
            o.total.toLocaleString("fa-IR"),
            <select
              key="s"
              value={o.status}
              disabled={busyId === o.id}
              onChange={(e) => handleStatusChange(o.id, e.target.value as Status)}
              className={`h-8 rounded-full border-0 px-3 text-xs font-bold disabled:opacity-60 ${statusLabel[o.status].cls}`}
            >
              {(Object.keys(statusLabel) as Status[]).map((k) => (
                <option key={k} value={k}>
                  {statusLabel[k].label}
                </option>
              ))}
            </select>,
            <button
              key="a"
              type="button"
              onClick={() => setSelectedOrder(o)}
              className="whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-brand-soft"
            >
              مشاهده و ویرایش
            </button>,
          ])}
        />
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg font-bold text-ink">
                جزئیات سفارش <bdi className="text-brand">{selectedOrder.id}</bdi>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-sm font-bold text-ink/40 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-ink">
              <div className="flex justify-between">
                <span className="text-ink/60">مشتری:</span>
                <span className="font-medium">{selectedOrder.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">تاریخ ثبت:</span>
                <span className="font-medium">{selectedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">محصول:</span>
                <span className="font-medium">{selectedOrder.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">مقدار سفارش:</span>
                <span className="font-medium">{selectedOrder.qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">مبلغ کل:</span>
                <span className="font-bold text-brand">{selectedOrder.total.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-ink/60">وضعیت سفارش:</span>
                <select
                  value={selectedOrder.status}
                  disabled={busyId === selectedOrder.id}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Status)}
                  className={`h-9 rounded-full border-0 px-3 text-xs font-bold disabled:opacity-60 ${statusLabel[selectedOrder.status].cls}`}
                >
                  {(Object.keys(statusLabel) as Status[]).map((k) => (
                    <option key={k} value={k}>
                      {statusLabel[k].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <StatusBadge status={selectedOrder.status} />
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand/90"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
