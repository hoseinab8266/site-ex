"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// سبد خرید در مرورگر (localStorage) نگهداری می‌شود.
// ⚠️ در مرحله دیتابیس، همین API (add / setQty / remove / clear) به سبد سمت سرور وصل شود.
const KEY = "polyrez_cart";

export type CartLine = { slug: string; qty: number }; // qty = تعداد بسته

type CartCtx = {
  lines: CartLine[];
  ready: boolean; // بعد از خواندن localStorage true می‌شود
  count: number; // مجموع تعداد بسته‌ها
  add: (slug: string, qty: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

const clamp = (n: number) => Math.min(999, Math.max(1, Math.floor(n) || 1));

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.slug === "string")
      .map((l) => ({ slug: l.slug as string, qty: clamp(Number(l.qty)) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setLines(read());
    setReady(true);
    // همگام‌سازی بین تب‌ها
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setLines(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* حافظه مرورگر در دسترس نیست؛ سبد فقط تا بستن صفحه می‌ماند */
    }
  }, []);

  const add = useCallback(
    (slug: string, qty: number) => {
      const cur = read();
      const found = cur.find((l) => l.slug === slug);
      commit(
        found
          ? cur.map((l) => (l.slug === slug ? { ...l, qty: clamp(l.qty + qty) } : l))
          : [...cur, { slug, qty: clamp(qty) }]
      );
    },
    [commit]
  );

  const setQty = useCallback(
    (slug: string, qty: number) =>
      commit(read().map((l) => (l.slug === slug ? { ...l, qty: clamp(qty) } : l))),
    [commit]
  );

  const remove = useCallback(
    (slug: string) => commit(read().filter((l) => l.slug !== slug)),
    [commit]
  );

  const clear = useCallback(() => commit([]), [commit]);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      ready,
      count: lines.reduce((s, l) => s + l.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [lines, ready, add, setQty, remove, clear]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart باید داخل CartProvider استفاده شود");
  return c;
}
