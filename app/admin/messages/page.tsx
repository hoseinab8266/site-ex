'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageTitle, Table } from "@/components/panel/ui";
import type { Message, MessageKind } from "@/lib/messages-store";

const kindLabel: Record<MessageKind, string> = {
  contact: "تماس با ما",
  consultation: "درخواست مشاوره",
};

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [selected, setSelected] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "دریافت پیام‌ها انجام نشد.");
      setMessages(body?.messages ?? []);
      setError(null);
    } catch (err) {
      setMessages([]);
      setError(err instanceof Error ? err.message : "دریافت پیام‌ها انجام نشد.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleRead(id: string, read: boolean) {
    setBusyId(id);
    setError(null);
    setMessages((prev) => prev?.map((m) => (m.id === id ? { ...m, read } : m)) ?? prev);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read }),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "تغییر وضعیت خوانده‌شدن انجام نشد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت خوانده‌شدن انجام نشد.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("این پیام برای همیشه حذف شود؟")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "حذف پیام انجام نشد.");
      setMessages((prev) => prev?.filter((m) => m.id !== id) ?? prev);
      if (selected?.id === id) setSelected(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حذف پیام انجام نشد.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageTitle title="پیام‌ها" hint="پیام‌های فرم تماس و درخواست‌های مشاوره" />

      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-900">{error}</p>
      )}

      {messages === null ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">در حال دریافت پیام‌ها…</p>
      ) : messages.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">پیامی ثبت نشده است.</p>
      ) : (
        <Table
          head={["نوع", "فرستنده", "تماس", "موضوع / محصول", "وضعیت", "اقدام"]}
          rows={messages.map((m) => [
            <span key="k" className="whitespace-nowrap">{kindLabel[m.kind]}</span>,
            <span key="n" className={m.read ? "font-medium" : "font-bold"}>{m.name}</span>,
            <bdi key="p" className="text-xs text-ink/70">{m.phone}</bdi>,
            m.subject ?? m.product ?? "—",
            m.read ? (
              <span key="r" className="text-xs text-ink/50">خوانده‌شده</span>
            ) : (
              <span key="r" className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">جدید</span>
            ),
            <div key="a" className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelected(m)}
                className="whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-brand-soft"
              >
                مشاهده
              </button>
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => toggleRead(m.id, !m.read)}
                className="whitespace-nowrap rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:bg-brand-soft disabled:opacity-60"
              >
                {m.read ? "علامت‌گذاری خوانده‌نشده" : "خوانده شد"}
              </button>
              <button
                type="button"
                disabled={busyId === m.id}
                onClick={() => handleDelete(m.id)}
                className="whitespace-nowrap rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
              >
                حذف
              </button>
            </div>,
          ])}
        />
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <h3 className="text-lg font-bold text-ink">
                {kindLabel[selected.kind]} — {selected.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm font-bold text-ink/40 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-ink">
              <div className="flex justify-between gap-4">
                <dt className="text-ink/60">شماره تماس</dt>
                <dd><bdi className="font-medium">{selected.phone}</bdi></dd>
              </div>
              {selected.email && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">ایمیل</dt>
                  <dd className="break-all">{selected.email}</dd>
                </div>
              )}
              {selected.company && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">شرکت</dt>
                  <dd>{selected.company}</dd>
                </div>
              )}
              {selected.subject && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">موضوع</dt>
                  <dd>{selected.subject}</dd>
                </div>
              )}
              {selected.product && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">دسته محصول</dt>
                  <dd>{selected.product}</dd>
                </div>
              )}
              {selected.quantity && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">مقدار موردنیاز</dt>
                  <dd>{selected.quantity}</dd>
                </div>
              )}
              {selected.application && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">کاربرد</dt>
                  <dd>{selected.application}</dd>
                </div>
              )}
              {selected.bestTime && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ink/60">زمان تماس</dt>
                  <dd>{selected.bestTime}</dd>
                </div>
              )}
              <div className="rounded-xl bg-paper p-4 leading-7">
                <dt className="mb-1 text-xs font-bold text-ink/60">متن پیام</dt>
                <dd className="whitespace-pre-wrap">{selected.text}</dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { toggleRead(selected.id, !selected.read); setSelected({ ...selected, read: !selected.read }); }}
                disabled={busyId === selected.id}
                className="rounded-xl border border-line px-4 py-2 text-sm font-bold hover:bg-brand-soft disabled:opacity-60"
              >
                {selected.read ? "علامت‌گذاری خوانده‌نشده" : "خوانده شد"}
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
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
