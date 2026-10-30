"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ELEMENT_AVATARS } from "@/lib/avatars";

export default function AvatarPicker() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/account/avatar", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.avatar && setCurrent(d.avatar))
      .catch(() => {});
  }, []);

  async function save(init: RequestInit) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/avatar", { method: "POST", ...init });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ذخیره تصویر انجام نشد.");
      setCurrent(data.avatar);
      setMessage({ ok: true, text: "تصویر پروفایل به‌روز شد." });
      router.refresh();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "ذخیره تصویر انجام نشد." });
    } finally {
      setSaving(false);
    }
  }

  function upload(file?: File) {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    void save({ body });
  }

  return (
    <section className="rounded-xl border border-line bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-brand-soft">
          {current && <img src={current} alt="تصویر پروفایل فعلی" className="h-full w-full object-cover" />}
        </div>
        <div>
          <h2 className="text-lg font-bold">تصویر پروفایل</h2>
          <p className="mt-1 text-sm text-ink/70">یکی از عناصر شیمیایی را انتخاب کنید یا عکس خودتان را بارگذاری کنید.</p>
          <label className={`mt-3 inline-flex cursor-pointer rounded-lg border border-brand/20 px-4 py-2 text-xs font-bold text-brand hover:bg-brand-soft ${saving ? "pointer-events-none opacity-60" : ""}`}>
            بارگذاری عکس (حداکثر ۲ مگابایت)
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6">
        {ELEMENT_AVATARS.map((element) => {
          const selected = current === element.url;
          return (
            <button
              key={element.url}
              type="button"
              disabled={saving}
              onClick={() => void save({ headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatar: element.url }) })}
              aria-pressed={selected}
              title={element.name}
              className={`overflow-hidden rounded-xl border-2 transition disabled:opacity-60 ${selected ? "border-action ring-2 ring-action/30" : "border-transparent hover:border-brand/40"}`}
            >
              <img src={element.url} alt={element.name} className="aspect-square w-full" />
            </button>
          );
        })}
      </div>

      {message && (
        <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm ${message.ok ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-800"}`}>{message.text}</p>
      )}
    </section>
  );
}
