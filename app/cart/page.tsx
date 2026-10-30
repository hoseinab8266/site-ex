import type { Metadata } from "next";
import Link from "next/link";
import CartView from "@/components/CartView";

export const metadata: Metadata = {
  title: "سبد خرید",
  description: "اقلام انتخاب‌شده خود را مرور کنید و برای آن‌ها پیش‌فاکتور رسمی بگیرید.",
};

function Chevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-ink/50">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export default function CartPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <nav aria-label="مسیر صفحه" className="mb-4">
            <ol className="flex items-center gap-2 text-sm text-ink/70">
              <li><Link href="/" className="hover:text-brand">خانه</Link></li>
              <li aria-hidden="true"><Chevron /></li>
              <li aria-current="page" className="font-medium text-ink">سبد خرید</li>
            </ol>
          </nav>
          <h1 className="border-s-4 border-action ps-3 text-2xl font-bold md:text-3xl">سبد خرید</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/75">
            مقدار هر قلم را بررسی کنید و برای صدور پیش‌فاکتور رسمی ادامه دهید.
          </p>
        </div>
      </section>

      <CartView />
    </>
  );
}
