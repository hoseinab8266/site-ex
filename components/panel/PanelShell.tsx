"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Item = { href: string; label: string };

export default function PanelShell({
  role,
  userName,
  avatar,
  nav,
  children,
}: {
  role: "buyer" | "admin";
  userName: string;
  avatar: string;
  nav: Item[];
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  const isActive = (href: string) => (nav[0].href === href ? path === href : path.startsWith(href));

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:py-10">
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-xl bg-ink p-5 text-white">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-action">
            <img src={avatar} alt={`تصویر پروفایل ${userName}`} className="h-full w-full object-cover" />
          </span>
          <p className="mt-3 font-bold">{userName}</p>
          <p className="mt-1 text-xs text-white/75">{role === "admin" ? "پنل مدیریت و اعضای شرکت" : "پنل خریدار"}</p>
        </div>

        <nav aria-label="منوی پنل" className="mt-3">
          <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {nav.map((n) => (
              <li key={n.href} className="shrink-0">
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ${
                    isActive(n.href) ? "bg-brand text-white" : "bg-white hover:bg-brand-soft"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="shrink-0 lg:mt-2">
              <button type="button" onClick={logout} className="block w-full whitespace-nowrap rounded-lg border border-line px-4 py-2.5 text-start text-sm text-ink/75 hover:bg-white">
                خروج از حساب
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <section className="min-w-0 space-y-6">{children}</section>
    </div>
  );
}
