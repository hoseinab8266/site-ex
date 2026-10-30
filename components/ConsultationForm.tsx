"use client";

import { useState } from "react";
import { contact, families } from "@/lib/data";

const fieldClass = "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/10";

export default function ConsultationForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      product: String(data.get("product") ?? ""),
      application: String(data.get("application") ?? ""),
      quantity: String(data.get("quantity") ?? ""),
      bestTime: String(data.get("time") ?? ""),
      text: String(data.get("details") ?? ""),
    };
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "ثبت درخواست انجام نشد.");
      setState("sent");
      setMessage("درخواست مشاوره شما ثبت شد. کارشناس فنی در زمان انتخابی تماس می‌گیرد.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "ثبت درخواست انجام نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-5 shadow-[0_12px_35px_-25px_rgba(6,48,58,.45)] sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-brand">فرم درخواست مشاوره</p>
        <h2 className="mt-2 text-2xl font-bold">کمی درباره نیازتان بگویید</h2>
        <p className="mt-2 text-sm leading-7 text-ink/65">هرچه اطلاعات کاربرد و فرایند دقیق‌تر باشد، بررسی گرید مناسب آسان‌تر می‌شود.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">نام و نام خانوادگی <span className="text-action">*</span>
          <input name="name" required autoComplete="name" placeholder="نام شما" className={fieldClass} />
        </label>
        <label className="text-sm font-medium">شماره تماس <span className="text-action">*</span>
          <input name="phone" required type="tel" autoComplete="tel" placeholder="مثلاً ۰۹۱۲۱۲۳۴۵۶۷" className={fieldClass} />
        </label>
        <label className="text-sm font-medium">ایمیل <span className="text-ink/45">(اختیاری)</span>
          <input name="email" type="email" autoComplete="email" placeholder="name@example.com" dir="ltr" className={fieldClass} />
        </label>
        <label className="text-sm font-medium">شرکت یا مجموعه <span className="text-ink/45">(اختیاری)</span>
          <input name="company" placeholder="نام مجموعه" className={fieldClass} />
        </label>
        <label className="text-sm font-medium">دسته محصول موردنظر <span className="text-action">*</span>
          <select name="product" required defaultValue="" className={fieldClass}>
            <option value="" disabled>انتخاب کنید</option>
            {families.map((family) => <option key={family.slug} value={family.name}>{family.name}</option>)}
            <option value="هنوز مطمئن نیستم">هنوز مطمئن نیستم</option>
          </select>
        </label>
        <label className="text-sm font-medium">مقدار تقریبی موردنیاز <span className="text-ink/45">(اختیاری)</span>
          <input name="quantity" placeholder="مثلاً ۵۰۰ کیلوگرم در ماه" className={fieldClass} />
        </label>
        <label className="text-sm font-medium sm:col-span-2">کاربرد و فرایند تولید <span className="text-action">*</span>
          <input name="application" required placeholder="مثلاً تزریق قطعات، تولید فیلم، پوشش کف..." className={fieldClass} />
        </label>
        <label className="text-sm font-medium">زمان مناسب تماس <span className="text-ink/45">(اختیاری)</span>
          <select name="time" defaultValue="فرقی ندارد" className={fieldClass}>
            <option>فرقی ندارد</option><option>صبح</option><option>ظهر</option><option>بعدازظهر</option>
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">توضیحات تکمیلی <span className="text-ink/45">(اختیاری)</span>
          <textarea name="details" rows={4} placeholder="خواص مورد انتظار، شرایط فرایند یا هر نکته‌ای که به انتخاب محصول کمک می‌کند..." className={`${fieldClass} resize-y`} />
        </label>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className="btn-action rounded-xl px-7 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60">
          {state === "sending" ? "در حال ثبت..." : "ثبت درخواست مشاوره"}
        </button>
        {message && (
          <p role="status" className={`text-sm leading-6 ${state === "error" ? "text-rose-700" : "text-brand"}`}>
            {message} اگر ترجیح می‌دهید، به <bdi dir="ltr">{contact.email}</bdi> هم ایمیل بزنید.
          </p>
        )}
      </div>
    </form>
  );
}
