"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartLink() {
  const [mounted, setMounted] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  const n = mounted && ready ? count : 0;

  return (
    <Link
      href="/cart"
      className="relative flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium hover:bg-brand-soft"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.4 11h11l2-8H6.5" />
      </svg>
      <span>سبد خرید</span>
      {n > 0 && (
        <>
          <span
            aria-hidden="true"
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-action px-1.5 text-xs font-bold text-ink"
          >
            {n.toLocaleString("fa-IR")}
          </span>
          <span className="sr-only">{n.toLocaleString("fa-IR")} بسته در سبد</span>
        </>
      )}
    </Link>
  );
}