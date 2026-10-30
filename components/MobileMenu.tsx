"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { href: string; label: string };

export default function MobileMenu({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="باز و بسته کردن منو"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-line bg-white"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="منوی موبایل"
          className="absolute end-0 top-12 w-56 rounded-lg border border-line bg-white p-2 shadow-lg"
        >
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-1 border-t border-line pt-1">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-brand-soft"
              >
                ورود یا ثبت‌نام
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
