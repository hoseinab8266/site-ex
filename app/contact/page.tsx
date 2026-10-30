import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { contact } from "@/lib/data";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با تیم پلیرز برای پرسش درباره مواد پلیمری، سفارش‌ها و همکاری تجاری.",
};

function Icon({ type }: { type: "phone" | "mail" | "pin" | "clock" }) {
  const paths = {
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 11.2 19a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 8.9a16 16 0 0 0 6 6l1.2-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2.1Z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{paths[type]}</svg>;
}

function ContactCard({ type, title, children }: { type: "phone" | "mail" | "pin" | "clock"; title: string; children: React.ReactNode }) {
  return <div className="flex gap-4 rounded-xl border border-line bg-white p-5">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon type={type}/></span>
    <div className="min-w-0"><h2 className="font-bold">{title}</h2><div className="mt-1 break-words text-sm leading-7 text-ink/70">{children}</div></div>
  </div>;
}

export default function ContactPage() {
  return <>
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 22% 55%, rgba(11,107,120,.72), transparent 60%), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "auto, 44px 44px, 44px 44px" }}/>
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav aria-label="مسیر صفحه" className="mb-5 text-sm text-white/70"><Link href="/" className="hover:text-white">خانه</Link><span className="mx-2">/</span><span aria-current="page" className="text-white">تماس با ما</span></nav>
        <p className="text-sm font-bold text-action">در کنار شما هستیم</p>
        <h1 className="mt-3 text-3xl font-bold leading-[1.7] md:text-4xl">با تیم <span className="text-action">پلیرز</span> در ارتباط باشید</h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/80 md:text-base">برای پرسش درباره محصولات، پیگیری سفارش یا همکاری با ما تماس بگیرید. اگر برای انتخاب گرید مناسب نیاز به راهنمایی دارید، می‌توانید درخواست مشاوره فنی ثبت کنید.</p>
        <Link href="/consultation" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-soft">درخواست مشاوره تخصصی <span className="ms-2" aria-hidden="true">←</span></Link>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-5 md:gap-10 md:py-16">
      <div className="space-y-4 md:col-span-2">
        <div><p className="text-sm font-bold text-brand">راه‌های ارتباطی</p><h2 className="mt-2 text-2xl font-bold">منتظر شنیدن صدای شما هستیم</h2></div>
        <ContactCard type="phone" title="تلفن تماس"><a className="font-bold text-brand hover:underline" href="tel:+982182884959" dir="ltr">{contact.phone}</a></ContactCard>
        <ContactCard type="mail" title="پست الکترونیکی"><a className="font-bold text-brand hover:underline" href={`mailto:${contact.email}`} dir="ltr">{contact.email}</a></ContactCard>
        <ContactCard type="pin" title="نشانی دفتر">{contact.address}</ContactCard>
        <ContactCard type="clock" title="ساعات پاسخ‌گویی">{contact.hours}</ContactCard>
        <div className="rounded-xl bg-brand-soft p-5"><h3 className="font-bold">مشاوره برای انتخاب مواد</h3><p className="mt-2 text-sm leading-7 text-ink/75">کاربرد، روش تولید و خواص موردنیازتان را با ما در میان بگذارید تا مسیر انتخاب محصول روشن‌تر شود.</p><Link href="/consultation" className="mt-3 inline-flex font-bold text-brand hover:underline">رفتن به فرم مشاوره ←</Link></div>
      </div>
      <div className="md:col-span-3"><ContactForm /></div>
    </section>
  </>;
}
