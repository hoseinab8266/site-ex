"use client";

import { useState } from "react";
import { Field, inputCls } from "@/components/panel/ui";

// رمز عبور حروف لاتین دارد؛ پس خودِ فیلد dir=ltr است اما کنار راست می‌نشیند (text-end)
// و دکمه «نمایش» در انتهای فیلد، یعنی سمت چپ در چیدمان راست‌به‌چپ.
export default function PasswordField({ label, name, autoComplete }: { label: string; name: string; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div dir="rtl" className="relative">
        <input
          name={name}
          required
          type={show ? "text" : "password"}
          dir="ltr"
          autoComplete={autoComplete}
          className={`${inputCls} ps-16 text-end`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-pressed={show}
          aria-label={show ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
          className="absolute end-2 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand-soft"
        >
          {show ? "پنهان" : "نمایش"}
        </button>
      </div>
    </Field>
  );
}
