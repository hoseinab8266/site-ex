"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { products } from "@/lib/data";

const f = "mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand";

export default function ProformaForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const slug = String(data.get("slug") ?? "");
    const qty = Number(data.get("qty"));
    if (!slug || !Number.isFinite(qty) || qty < 1) {
      setNote("محصول و مقدار معتبر را انتخاب کنید.");
      setState("error");
      return;
    }

    setState("sending");
    setNote("");
    try {
      const res = await fetch("/api/proforma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, qty, note: String(data.get("note") ?? "") }),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "ثبت درخواست انجام نشد.");
      setState("sent");
      setNote("درخواست شما ثبت شد. پیش‌فاکتور پس از بررسی کارشناس فروش در همین بخش نمایش داده می‌شود.");
      form.reset();
      router.refresh();
    } catch (err) {
      setState("error");
      setNote(err instanceof Error ? err.message : "ثبت درخواست انجام نشد.");
    }
  }

  return (
    <>
      {note && (
        <p
          role={state === "error" ? "alert" : "status"}
          className={`mb-4 rounded-xl px-4 py-3 text-sm leading-7 ${state === "error" ? "bg-rose-50 text-rose-900" : "bg-emerald-50 text-emerald-900"}`}
        >
          {note}
        </p>
      )}

      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-line bg-white p-5 md:grid-cols-3">
        <label className="text-sm font-medium md:col-span-1">
          محصول
          <select name="slug" required className={f}>
            {products.map((p) => (
              <option key={p.slug} value={p.slug}>{p.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          تعداد بسته / مقدار
          <input
            name="qty"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={1}
            className={f}
          />
        </label>
        <label className="text-sm font-medium">
          توضیحات <span className="text-ink/60">(اختیاری)</span>
          <input name="note" placeholder="کاربرد یا زمان تحویل" className={f} />
        </label>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-action rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {state === "sending" ? "در حال ثبت…" : "ثبت درخواست پیش‌فاکتور"}
          </button>
        </div>
      </form>
    </>
  );
}
