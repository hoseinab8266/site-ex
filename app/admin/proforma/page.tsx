'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageTitle, Pill, Table } from "@/components/panel/ui";
import { proformaStateLabel, type Proforma, type ProformaState } from "@/lib/panel-data";

const states = Object.keys(proformaStateLabel) as ProformaState[];

export default function AdminProforma() {
  const [proformas, setProformas] = useState<Proforma[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/proforma", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "دریافت پیش‌فاکتورها انجام نشد.");
      setProformas(body?.proformas ?? []);
      setError(null);
    } catch (err) {
      setProformas([]);
      setError(err instanceof Error ? err.message : "دریافت پیش‌فاکتورها انجام نشد.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleStateChange(id: string, state: ProformaState) {
    setBusyId(id);
    setError(null);
    // به‌روزرسانی خوش‌بینانه، سپس تأیید سرور
    setProformas((prev) => prev?.map((p) => (p.id === id ? { ...p, state } : p)) ?? prev);
    try {
      const res = await fetch("/api/admin/proforma", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, state }),
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
      <PageTitle title="پیش‌فاکتورها" hint="بررسی درخواست‌های مشتریان و صدور پیش‌فاکتور" />

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-900">{error}</p>
      )}

      {proformas === null ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">در حال دریافت پیش‌فاکتورها…</p>
      ) : proformas.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">پیش‌فاکتوری ثبت نشده است.</p>
      ) : (
        <Table
          head={["شماره", "تاریخ", "مشتری", "محصول", "مقدار", "وضعیت", "اقدام"]}
          rows={proformas.map((p) => [
            <bdi key="i" className="font-medium">{p.id}</bdi>,
            p.date,
            p.customer ?? "—",
            p.item,
            p.qty,
            <Pill key="s" tone={proformaStateLabel[p.state].tone}>{proformaStateLabel[p.state].label}</Pill>,
            <select
              key="a"
              value={p.state}
              disabled={busyId === p.id}
              onChange={(e) => handleStateChange(p.id, e.target.value as ProformaState)}
              className="h-8 rounded-lg border border-line bg-white px-2 text-xs font-medium outline-none focus:border-brand disabled:opacity-60"
            >
              {states.map((k) => (
                <option key={k} value={k}>
                  {proformaStateLabel[k].label}
                </option>
              ))}
            </select>,
          ])}
        />
      )}
    </>
  );
}
