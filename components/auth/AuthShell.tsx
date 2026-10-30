import type { ReactNode } from "react";

// چیدمان راست‌به‌چپ: فرم در سمت راست، معرفی برند در سمت چپ
export default function AuthShell({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div dir="rtl" className="mx-auto grid max-w-5xl items-stretch px-4 py-12 md:grid-cols-2 md:py-16">
      <div className="rounded-2xl border border-line bg-white p-6 text-start md:rounded-e-none md:p-10">
        <h1 className="text-xl font-bold">{title}</h1>
        {hint && <p className="mt-1 text-sm text-ink/70">{hint}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <aside className="hidden rounded-e-2xl bg-ink p-10 text-start text-white md:block">
        <p className="text-sm font-medium text-action">پلیرز</p>
        <h2 className="mt-2 text-2xl font-bold leading-10">مواد پلیمری با مشخصات فنی مستند</h2>
        <ul className="mt-6 space-y-4 text-sm leading-7 text-white/85">
          <li className="flex gap-3"><span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-action" />پیگیری سفارش‌ها و پیش‌فاکتورها در یک‌جا</li>
          <li className="flex gap-3"><span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-action" />ثبت درخواست مشاوره و دریافت برگه فنی</li>
          <li className="flex gap-3"><span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-action" />مدیریت اطلاعات و سفارش‌ها</li>
        </ul>
      </aside>
    </div>
  );
}
