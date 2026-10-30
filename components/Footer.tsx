import Link from "next/link";
import Logo from "./Logo";
import { families, contact } from "@/lib/data";

const help = [
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/consultation", label: "درخواست مشاوره" },
  { href: "/orders", label: "پیگیری سفارش" },
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/privacy", label: "حریم خصوصی" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7">
            پلیرز، فروشگاه آنلاین شرکت دانش‌بنیان آتیه رزین شریف. مواد پلیمری و
            رزین‌های صنعتی با مشخصات فنی روشن.
          </p>
        </div>

        <nav aria-label="محصولات">
          <h2 className="text-base font-bold text-white">محصولات</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {families.slice(0, 5).map((f) => (
              <li key={f.slug}>
                <Link href={`/products?category=${f.slug}`} className="hover:text-white">
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="راهنما">
          <h2 className="text-base font-bold text-white">راهنما</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {help.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-base font-bold text-white">تماس با ما</h2>
          <ul className="mt-4 space-y-2.5 text-sm leading-7">
            <li><bdi dir="ltr">{contact.phone}</bdi></li>
            <li><bdi dir="ltr">{contact.email}</bdi></li>
            <li>{contact.address}</li>
            <li>{contact.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/75">
          © ۱۴۰۵ شرکت دانش‌بنیان آتیه رزین شریف. همه حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}
