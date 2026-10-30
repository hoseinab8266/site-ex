"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputCls, Pill } from "@/components/panel/ui";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "enabled"; backupCodesLeft: number }
  | { kind: "pending"; secret: string; uri: string; qr: string | null }
  | { kind: "codes"; codes: string[] };

// فعال‌سازی ورود دومرحله‌ای (TOTP) برای مدیر:
// کلید در سرور ساخته و «در انتظار تأیید» ذخیره می‌شود؛ فقط پس از وارد کردن یک کد درست فعال می‌گردد.
export default function TotpSetup({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/account/totp", { cache: "no-store" });
      const d = await res.json();
      if (!res.ok) { setState({ kind: "error", message: d.error ?? "دریافت وضعیت انجام نشد." }); return; }
      setState(
        d.enabled
          ? { kind: "enabled", backupCodesLeft: d.backupCodesLeft ?? 0 }
          : { kind: "pending", secret: d.secret, uri: d.uri, qr: d.qr ?? null },
      );
    } catch {
      setState({ kind: "error", message: "ارتباط با سرور برقرار نشد." });
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account/totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "عملیات انجام نشد."); return null; }
      return d as Record<string, unknown>;
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = await post({ action: "confirm", code: f.get("code") });
    if (!d) return;
    setState({ kind: "codes", codes: (d.backupCodes as string[]) ?? [] });
    router.refresh();
  }

  async function disable(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const d = await post({ action: "disable", password: String(f.get("password") ?? "") });
    if (!d) return;
    // نشست تازه و بدون محدودیت از سرور صادر شده است؛ به پنل می‌رویم.
    router.push("/admin");
    router.refresh();
  }

  async function regen() {
    const d = await post({ action: "regen" });
    if (!d) return;
    setState({ kind: "pending", secret: String(d.secret), uri: String(d.uri), qr: (d.qr as string | null) ?? null });
  }

  async function copyCodes(codes: string[]) {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (state.kind === "loading") {
    return <p className="text-sm text-ink/70">در حال دریافت وضعیت…</p>;
  }

  if (state.kind === "error") {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-sm font-medium text-rose-800">{state.message}</p>
        <button type="button" onClick={() => void load()} className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-bold text-brand">تلاش دوباره</button>
      </div>
    );
  }

  // ---------- کدهای پشتیبان (یک‌بار نمایش) ----------
  if (state.kind === "codes") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="font-bold text-emerald-900">ورود دومرحله‌ای فعال شد ✅</h2>
        <p className="mt-2 text-sm leading-7 text-emerald-900/90">
          این کدهای پشتیبان <strong>فقط همین یک بار</strong> نمایش داده می‌شوند. هر کدام را در جای امنی نگه دارید؛
          اگر گوشی را از دست دادید، با هر کد یک بار می‌توانید وارد شوید.
        </p>
        <ul dir="ltr" className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-white p-4 font-mono text-sm text-ink">
          {state.codes.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => void copyCodes(state.codes)} className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-bold text-emerald-900">
            {copied ? "کپی شد" : "کپی همهٔ کدها"}
          </button>
          <button type="button" onClick={() => { router.push("/admin"); router.refresh(); }} className="btn-action rounded-xl px-6 py-2.5 text-sm font-bold">
            ورود به پنل مدیریت
          </button>
        </div>
      </div>
    );
  }

  // ---------- تازه فعال شده / غیرفعال ----------
  if (state.kind === "enabled") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-5">
          <div>
            <p className="font-bold">وضعیت: فعال</p>
            <p className="mt-1 text-sm text-ink/70">{state.backupCodesLeft} کد پشتیبان مصرف‌نشده باقی مانده است.</p>
          </div>
          <Pill tone="green">فعال</Pill>
        </div>

        <form onSubmit={disable} className="space-y-4 rounded-xl border border-line bg-white p-5">
          <h2 className="font-bold">غیرفعال‌کردن ورود دومرحله‌ای</h2>
          <p className="text-sm leading-7 text-ink/70">
            با غیرفعال‌سازی، امنیت حساب پایین می‌آید و همهٔ نشست‌های فعال باطل می‌شوند. برای تأیید، رمز عبور فعلی را وارد کنید.
          </p>
          <Field label="رمز عبور فعلی">
            <input name="password" type="password" dir="ltr" required autoComplete="current-password" className={`${inputCls} text-end`} />
          </Field>
          <button type="submit" disabled={busy} className="rounded-lg border border-rose-300 bg-rose-50 px-5 py-2.5 text-sm font-bold text-rose-800 disabled:opacity-60">
            {busy ? "در حال بررسی…" : "غیرفعال کن"}
          </button>
        </form>
      </div>
    );
  }

  // ---------- کلید در انتظار تأیید ----------
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-white p-5">
        <h2 className="font-bold">۱. برنامهٔ Authenticator را نصب کنید</h2>
        <p className="mt-2 text-sm leading-7 text-ink/70">
          برنامهٔ Google Authenticator (یا هر برنامهٔ TOTP دیگر) را روی گوشی نصب کنید، سپس کد QR زیر را اسکن کنید.
        </p>

        <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row">
          <div className="shrink-0 rounded-xl border border-line bg-white p-3">
            {state.qr ? (
              // خروجی SVG از سرور (بستهٔ اختیاری qrcode)
              <div className="h-[220px] w-[220px]" dangerouslySetInnerHTML={{ __html: state.qr }} />
            ) : (
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg bg-paper p-4 text-center text-xs leading-6 text-ink/70">
                نمایش QR در دسترس نیست؛ از کلید متنی زیر برای افزودن دستی استفاده کنید.
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium">کلید متنی (ورود دستی):</p>
              <code dir="ltr" className="mt-2 block break-all rounded-lg bg-paper px-3 py-2 font-mono text-sm">{state.secret}</code>
            </div>
            <div>
              <p className="text-sm font-medium">آدرس otpauth (برای «افزودن دستی»):</p>
              <code dir="ltr" className="mt-2 block break-all rounded-lg bg-paper px-3 py-2 font-mono text-xs">{state.uri}</code>
            </div>
            <button type="button" onClick={() => void regen()} disabled={busy} className="text-sm font-semibold text-brand hover:underline disabled:opacity-60">
              ساخت کلید تازه
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={confirm} className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-bold">۲. کد ۶ رقمی برنامه را وارد کنید</h2>
        <p className="text-sm leading-7 text-ink/70">پس از افزودن حساب، کدی که برنامه نشان می‌دهد را وارد کنید تا فعال‌سازی کامل شود.</p>
        <Field label="کد ورود دومرحله‌ای">
          <input name="code" required dir="ltr" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="۱۲۳۴۵۶" className={`${inputCls} text-center tracking-[0.4em]`} />
        </Field>
        {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">{error}</p>}
        <button type="submit" disabled={busy} className="btn-action rounded-xl px-6 py-3 font-bold disabled:opacity-60">
          {busy ? "در حال بررسی…" : "فعال‌سازی ورود دومرحله‌ای"}
        </button>
        {forced && <p className="text-xs leading-6 text-ink/60">تا زمان فعال‌سازی، دسترسی شما به سایر بخش‌های پنل بسته است.</p>}
      </form>
    </div>
  );
}
