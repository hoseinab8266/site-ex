"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import { Field, inputCls } from "@/components/panel/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("confirm")) { setError("تکرار رمز عبور یکسان نیست."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"), company: f.get("company"), mobile: f.get("mobile"),
          password: f.get("password"), confirm: f.get("confirm"), terms: f.get("terms") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "ثبت‌نام انجام نشد."); return; }
      router.push(data.redirect);
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="ثبت‌نام" hint="برای ثبت سفارش و دریافت پیش‌فاکتور، حساب بسازید.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="نام و نام خانوادگی"><input name="name" required autoComplete="name" className={inputCls} /></Field>
        <Field label="نام شرکت (اختیاری)"><input name="company" autoComplete="organization" className={inputCls} /></Field>
        <Field label="شماره موبایل">
          <input name="mobile" required dir="ltr" inputMode="tel" autoComplete="tel" placeholder="09xxxxxxxxx" className={`${inputCls} text-end`} />
        </Field>
        <PasswordField label="رمز عبور (حداقل ۸ کاراکتر، شامل حرف و عدد)" name="password" autoComplete="new-password" />
        <PasswordField label="تکرار رمز عبور" name="confirm" autoComplete="new-password" />

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[var(--color-brand)]" />
          <span><Link href="/terms" className="font-medium text-brand hover:underline">قوانین و مقررات</Link> را می‌پذیرم.</span>
        </label>

        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}

        <button type="submit" disabled={loading} className="btn-action flex w-full items-center justify-center rounded-xl px-6 py-3 font-bold disabled:opacity-60">
          {loading ? "در حال ساخت حساب..." : "ساخت حساب"}
        </button>
      </form>

      <p className="mt-5 text-sm text-ink/75">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">ورود</Link>
      </p>
    </AuthShell>
  );
}
