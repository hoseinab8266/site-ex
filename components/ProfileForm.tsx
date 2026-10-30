"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const f = "mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand";

export type ProfileData = {
  name: string;
  company: string;
  nationalId: string;
  economicCode: string;
  mobile: string;
  email: string;
  address: string;
};

type Note = { kind: "ok" | "error"; text: string };

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      nationalId: String(data.get("nationalId") ?? ""),
      economicCode: String(data.get("economicCode") ?? ""),
      mobile: String(data.get("mobile") ?? ""),
      email: String(data.get("email") ?? ""),
      address: String(data.get("address") ?? ""),
    };
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "ذخیره مشخصات انجام نشد.");
      setNote({ kind: "ok", text: body?.message || "مشخصات ذخیره شد." });
      router.refresh();
    } catch (error) {
      setNote({ kind: "error", text: error instanceof Error ? error.message : "ذخیره مشخصات انجام نشد." });
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      current: String(data.get("current") ?? ""),
      password: String(data.get("password") ?? ""),
      confirm: String(data.get("confirm") ?? ""),
    };
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "تغییر رمز انجام نشد.");
      form.reset();
      setNote({ kind: "ok", text: body?.message || "رمز عبور تغییر کرد." });
    } catch (error) {
      setNote({ kind: "error", text: error instanceof Error ? error.message : "تغییر رمز انجام نشد." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {note && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${note.kind === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}
        >
          {note.text}
        </p>
      )}

      <form onSubmit={saveProfile} className="grid gap-4 rounded-xl border border-line bg-white p-5 md:grid-cols-2">
        <h2 className="text-lg font-bold md:col-span-2">مشخصات و اطلاعات فاکتور</h2>
        <label className="text-sm font-medium">نام و نام خانوادگی<input name="name" defaultValue={profile.name} required minLength={2} className={f} /></label>
        <label className="text-sm font-medium">نام شرکت<input name="company" defaultValue={profile.company} className={f} /></label>
        <label className="text-sm font-medium">شناسه ملی یا کد ملی<input name="nationalId" defaultValue={profile.nationalId} dir="ltr" inputMode="numeric" className={`${f} text-start`} /></label>
        <label className="text-sm font-medium">کد اقتصادی<input name="economicCode" defaultValue={profile.economicCode} dir="ltr" inputMode="numeric" className={`${f} text-start`} /></label>
        <label className="text-sm font-medium">شماره موبایل<input name="mobile" defaultValue={profile.mobile} dir="ltr" inputMode="tel" className={`${f} text-start`} /></label>
        <label className="text-sm font-medium">ایمیل<input name="email" defaultValue={profile.email} dir="ltr" type="email" className={`${f} text-start`} /></label>
        <label className="text-sm font-medium md:col-span-2">
          آدرس تحویل
          <textarea name="address" defaultValue={profile.address} rows={3} className="mt-1.5 w-full rounded-lg border border-line bg-white p-3 text-sm outline-none focus:border-brand" />
        </label>
        <div className="md:col-span-2">
          <button type="submit" disabled={busy} className="btn-action rounded-xl px-6 py-2.5 text-sm font-bold disabled:opacity-60">
            {busy ? "در حال ذخیره…" : "ذخیره مشخصات"}
          </button>
        </div>
      </form>

      <form onSubmit={changePassword} className="grid gap-4 rounded-xl border border-line bg-white p-5 md:grid-cols-3">
        <h2 className="text-lg font-bold md:col-span-3">تغییر رمز عبور</h2>
        <label className="text-sm font-medium">رمز فعلی<input name="current" type="password" dir="ltr" autoComplete="current-password" required className={`${f} text-start`} /></label>
        <label className="text-sm font-medium">رمز جدید<input name="password" type="password" dir="ltr" autoComplete="new-password" minLength={8} required className={`${f} text-start`} /></label>
        <label className="text-sm font-medium">تکرار رمز جدید<input name="confirm" type="password" dir="ltr" autoComplete="new-password" minLength={8} required className={`${f} text-start`} /></label>
        <p className="text-xs text-ink/60 md:col-span-3">رمز جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.</p>
        <div className="md:col-span-3">
          <button type="submit" disabled={busy} className="rounded-xl bg-ink px-6 py-2.5 text-sm font-bold text-white hover:bg-brand disabled:opacity-60">
            تغییر رمز
          </button>
        </div>
      </form>
    </div>
  );
}
