import Link from "next/link";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import CartLink from "./CartLink";
import { navItems, contact } from "@/lib/data";
import { getSession, homeFor } from "@/lib/auth";

export default async function Header() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_var(--color-line),0_6px_18px_-12px_rgba(6,48,58,.35)]">
      <div className="bg-ink text-xs text-white/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
          <p className="hidden whitespace-nowrap sm:block">{contact.hours}</p>
          <p className="flex items-center gap-4">
            <a href={`mailto:${contact.email}`} dir="ltr" className="hidden hover:text-white sm:inline">
              {contact.email}
            </a>
            <a href="tel:+982182884959" className="flex items-center gap-1.5 whitespace-nowrap font-bold text-white">
              <span>تماس:</span>
              <bdi dir="ltr">{contact.phone}</bdi>
            </a>
          </p>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-6 px-4">
        <Link href="/" aria-label="پلیرز، صفحه اصلی">
          <Logo />
        </Link>

        <nav aria-label="منوی اصلی" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="whitespace-nowrap py-2 hover:text-brand">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <form action="/products" role="search" className="hidden flex-1 md:block md:max-w-xs">
          <input
            type="search"
            name="q"
            aria-label="جستجوی گرید یا محصول"
            placeholder="جستجوی گرید، مثلاً PP 1500"
            className="h-10 w-full rounded-full border border-line bg-paper px-4 text-sm outline-none focus:border-brand"
          />
        </form>

        <div className="flex items-center gap-2">
          <CartLink />
          <Link
            href={session ? homeFor(session.role) : "/login"}
            className="hidden h-10 items-center whitespace-nowrap rounded-full bg-ink px-5 text-sm font-medium text-white hover:bg-brand md:flex"
          >
            {session ? "پنل من" : "ورود"}
          </Link>
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
