"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { Field, inputCls } from "@/components/panel/ui";

// ورود کارکنان شرکت (مدیر / کارشناس فروش) — جدا از ورود عمومی مشتریان.
// مرحلهٔ ۱: نام کاربری و رمز عبور. مرحلهٔ ۲ (فقط مدیر): کد Google Authenticator یا کد پشتیبان.
export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "totp">("password");
  const [ticket, setTicket] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextParam = () =>
    typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("next");

  async function submitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: f.get("id"), password: f.get("password"), next: nextParam() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "ورود انجام نشد."); return; }
      if (data.totpRequired) { setTicket(data.ticket); setStep("totp"); return; }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, code: String(f.get("code") ?? "").trim(), next: nextParam() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "کد وارد‌شده معتبر نیست."); return; }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="ورود کارکنان"
      hint={step === "password" ? "این صفحه مخصوص مدیر و کارشناسان فروش شرکت است." : "کد ۶ رقمی برنامهٔ Authenticator را وارد کنید."}
    >
      {step === "password" ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <Field label="نام کاربری">
            <input name="id" required dir="ltr" autoComplete="username" className={`${inputCls} text-end`} />
          </Field>
          <PasswordField label="رمز عبور" name="password" autoComplete="current-password" />
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
          <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
            {loading ? "در حال بررسی..." : "ادامه"}
          </button>
          <p className="text-xs leading-6 text-ink/60">
            نشست کارکنان حداکثر ۱۲ ساعت اعتبار دارد و «مرا به خاطر بسپار» ندارد.
          </p>
        </form>
      ) : (
        <form onSubmit={submitTotp} className="space-y-4">
          <Field label="کد ورود دومرحله‌ای">
            <input
              name="code"
              required
              autoFocus
              dir="ltr"
              inputMode="text"
              autoComplete="one-time-code"
              placeholder="۱۲۳۴۵۶"
              className={`${inputCls} text-center tracking-[0.4em]`}
            />
          </Field>
          <p className="text-xs leading-6 text-ink/60">
            اگر به گوشی دسترسی ندارید، یکی از کدهای پشتیبان (مثل <span dir="ltr" className="font-mono">ABCD-EFGH</span>) را وارد کنید. هر کد پشتیبان فقط یک بار کار می‌کند.
          </p>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
          <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
            {loading ? "در حال بررسی..." : "تأیید و ورود"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("password"); setTicket(""); setError(""); }}
            className="w-full py-1 text-sm font-semibold text-brand hover:underline"
          >
            بازگشت به مرحلهٔ رمز عبور
          </button>
        </form>
      )}

      <p className="mt-5 text-sm text-ink/75">
        مشتری هستید؟{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">ورود مشتریان</Link>
      </p>
    </AuthShell>
  );
}
