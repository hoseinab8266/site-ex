"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { Field, inputCls } from "@/components/panel/ui";

type LoginMethod = "password" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>("password");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mobile, setMobile] = useState("");

  async function submitPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: f.get("id"),
          password: f.get("password"),
          remember: f.get("remember") === "on",
          next: new URLSearchParams(window.location.search).get("next"),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "ورود انجام نشد."); return; }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "ارسال رمز انجام نشد."); return; }
      setOtpSent(true);
      setNotice("رمز یک‌بارمصرف در بله ارسال شد و تا ۵ دقیقه معتبر است.");
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile,
          otp: f.get("otp"),
          remember: f.get("remember") === "on",
          next: new URLSearchParams(window.location.search).get("next"),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "رمز واردشده معتبر نیست."); return; }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="ورود به حساب" hint="با رمز عبور یا رمز یک‌بارمصرف بله وارد حساب خود شوید.">
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="روش ورود">
        <button type="button" role="tab" aria-selected={method === "password"} onClick={() => { setMethod("password"); setError(""); setNotice(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${method === "password" ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>رمز عبور</button>
        <button type="button" role="tab" aria-selected={method === "otp"} onClick={() => { setMethod("otp"); setError(""); setNotice(""); }} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${method === "otp" ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>رمز یک‌بارمصرف بله</button>
      </div>

      {method === "password" ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <Field label="نام کاربری یا شماره موبایل">
            <input name="id" required dir="ltr" autoComplete="username" className={`${inputCls} text-end`} />
          </Field>
          <PasswordField label="رمز عبور" name="password" autoComplete="current-password" />
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="remember" className="h-4 w-4 accent-[var(--color-brand)]" />
              مرا به خاطر بسپار
            </label>
            <Link href="/forgot-password" className="whitespace-nowrap font-medium text-brand hover:underline">رمز را فراموش کرده‌اید؟</Link>
          </div>
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
          <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <Field label="شماره موبایل">
                <input name="mobile" required dir="ltr" inputMode="tel" autoComplete="tel" pattern="09[0-9]{9}" title="شماره موبایل را با 09 و ۱۱ رقم وارد کنید" placeholder="09123456789" value={mobile} onChange={(e) => setMobile(e.target.value)} className={`${inputCls} text-end`} />
              </Field>
              <p className="text-xs leading-6 text-slate-500">رمز به حساب بله متصل به این شماره ارسال می‌شود. اگر حساب کاربری نداشته باشید، پس از ورود به‌صورت خودکار ساخته می‌شود.</p>
              {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
              {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{notice}</p>}
              <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">{loading ? "در حال ارسال..." : "ارسال رمز در بله"}</button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <p className="text-sm leading-6 text-ink/75">رمز ارسال‌شده به بله برای شماره <span dir="ltr" className="font-bold">{mobile}</span> را وارد کنید.</p>
              <Field label="رمز یک‌بارمصرف">
                <input name="otp" required dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="••••••" className={`${inputCls} text-center tracking-[0.4em]`} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="remember" className="h-4 w-4 accent-[var(--color-brand)]" />
                مرا به خاطر بسپار
              </label>
              {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
              {notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">{notice}</p>}
              <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">{loading ? "در حال بررسی..." : "تأیید رمز و ورود"}</button>
              <button type="button" onClick={() => { setOtpSent(false); setError(""); setNotice(""); }} className="w-full py-1 text-sm font-semibold text-brand hover:underline">تغییر شماره یا ارسال دوباره</button>
            </form>
          )}
        </div>
      )}

      <p className="mt-5 text-sm text-ink/75">
        حساب ندارید؟{" "}
        <Link href="/register" className="font-bold text-brand hover:underline">ثبت‌نام</Link>
      </p>
      <p className="mt-3 border-t border-line pt-3 text-xs leading-6 text-ink/60">
        این صفحه مخصوص مشتریان است. کارکنان شرکت از نشانی ورود اختصاصی پنل مدیریت وارد می‌شوند.
      </p>
    </AuthShell>
  );
}
