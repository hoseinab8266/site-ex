"use client";

import { useState } from "react";
import { contact } from "@/lib/data";

const fieldClass = "mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-brand focus:ring-2 focus:ring-brand/10";

export default function ContactForm() {
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
      subject: String(data.get("subject") ?? ""),
      text: String(data.get("message") ?? ""),
    };
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? "ارسال پیام انجام نشد.");
      setState("sent");
      setMessage("پیام شما ثبت شد. کارشناسان ما در اولین فرصت پاسخ می‌دهند.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "ارسال پیام انجام نشد.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-5 shadow-[0_12px_35px_-25px_rgba(6,48,58,.45)] sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-bold text-brand">پیام خود را بنویسید</p>
        <h2 className="mt-2 text-2xl font-bold">چطور می‌توانیم کمک کنیم؟</h2>
        <p className="mt-2 text-sm leading-7 text-ink/65">فیلدهای ستاره‌دار الزامی هستند. پیام شما در سامانه ثبت می‌شود و کارشناسان ما با شما تماس می‌گیرند.</p>
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
        <label className="text-sm font-medium">موضوع پیام <span className="text-action">*</span>
          <select name="subject" required defaultValue="" className={fieldClass}>
            <option value="" disabled>یک موضوع انتخاب کنید</option>
            <option>پرسش درباره محصولات</option>
            <option>پیگیری سفارش</option>
            <option>همکاری تجاری</option>
            <option>سایر موارد</option>
          </select>
        </label>
        <label className="text-sm font-medium sm:col-span-2">متن پیام <span className="text-action">*</span>
          <textarea name="message" required rows={5} placeholder="پیام یا پرسش خود را اینجا بنویسید..." className={`${fieldClass} resize-y`} />
        </label>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={state === "sending"} className="btn-action rounded-xl px-7 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60">
          {state === "sending" ? "در حال ارسال..." : "ثبت و ارسال پیام"}
        </button>
        {message && (
          <p role="status" className={`text-sm leading-6 ${state === "error" ? "text-rose-700" : "text-brand"}`}>
            {message} در صورت تمایل می‌توانید مستقیماً به <bdi dir="ltr">{contact.email}</bdi> هم ایمیل بزنید.
          </p>
        )}
      </div>
    </form>
  );
}
