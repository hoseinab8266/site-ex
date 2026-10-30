"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { Field, inputCls } from "@/components/panel/ui";

type Step = "mobile" | "reset";

export default function ForgotPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = String(new FormData(e.currentTarget).get("mobile") ?? "");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: value }),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "ارسال رمز انجام نشد.");
      setMobile(value);
      setStep("reset");
      setNote("اگر حسابی با این شماره وجود داشته باشد، رمز یک‌بارمصرف از طریق بله ارسال شده است.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال رمز انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          otp: f.get("otp"),
          password: f.get("password"),
          confirm: f.get("confirm"),
        }),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "تعیین رمز جدید انجام نشد.");
      router.push(body?.redirect || "/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعیین رمز جدید انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="بازیابی رمز عبور"
      hint={step === "mobile" ? "شماره موبایل حساب خود را وارد کنید." : "رمز یک‌بارمصرف ارسال‌شده را وارد کنید."}
    >
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-3 text-sm leading-7 text-rose-900">{error}</p>}
      {note && !error && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-3 text-sm leading-7 text-emerald-900">{note}</p>}

      {step === "mobile" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <Field label="شماره موبایل">
            <input name="mobile" required dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09xxxxxxxxx" className={`${inputCls} text-end`} />
          </Field>
          <p className="text-xs leading-6 text-ink/60">بازیابی رمز فقط برای حساب‌های مشتری و از طریق پیام‌رسان بله انجام می‌شود.</p>
          <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
            {loading ? "در حال ارسال..." : "ارسال رمز یک‌بارمصرف"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4">
          <Field label="رمز یک‌بارمصرف">
            <input name="otp" required dir="ltr" inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="------" className={`${inputCls} text-center tracking-[0.4em]`} />
          </Field>
          <Field label="رمز جدید">
            <input name="password" type="password" required dir="ltr" minLength={8} autoComplete="new-password" className={`${inputCls} text-end`} />
          </Field>
          <Field label="تکرار رمز جدید">
            <input name="confirm" type="password" required dir="ltr" minLength={8} autoComplete="new-password" className={`${inputCls} text-end`} />
          </Field>
          <p className="text-xs leading-6 text-ink/60">رمز جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.</p>
          <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
            {loading ? "در حال ذخیره..." : "تعیین رمز جدید"}
          </button>
          <button type="button" onClick={() => { setStep("mobile"); setError(null); setNote(null); }} className="w-full text-sm font-bold text-brand hover:underline">
            تغییر شماره موبایل
          </button>
        </form>
      )}

      <p className="mt-5 text-sm">
        <Link href="/login" className="font-bold text-brand hover:underline">بازگشت به ورود</Link>
      </p>
    </AuthShell>
  );
}
