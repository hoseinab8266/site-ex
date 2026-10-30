import type { Metadata } from "next";
import Link from "next/link";
import ConsultationForm from "@/components/ConsultationForm";

export const metadata: Metadata = {
  title: "درخواست مشاوره تخصصی",
  description: "درخواست مشاوره فنی برای انتخاب مواد پلیمری و رزین متناسب با کاربرد و فرایند تولید شما.",
};

const steps = [
  { n: "۱", title: "شرح نیاز", text: "کاربرد، روش تولید و خواص مورد انتظار را برای ما بنویسید." },
  { n: "۲", title: "بررسی فنی", text: "اطلاعات شما مبنای بررسی گزینه‌ها و گریدهای مناسب خواهد بود." },
  { n: "۳", title: "گفت‌وگو با کارشناس", text: "برای بررسی گزینه‌ها و پرسش‌های تکمیلی با شما هماهنگ می‌کنیم." },
];

export default function ConsultationPage() {
  return <>
    <section className="relative overflow-hidden bg-ink text-white">
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 78% 45%, rgba(11,107,120,.75), transparent 58%), linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)", backgroundSize: "auto, 44px 44px, 44px 44px" }}/>
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <nav aria-label="مسیر صفحه" className="mb-5 text-sm text-white/70"><Link href="/" className="hover:text-white">خانه</Link><span className="mx-2">/</span><Link href="/contact" className="hover:text-white">تماس با ما</Link><span className="mx-2">/</span><span aria-current="page" className="text-white">درخواست مشاوره</span></nav>
        <p className="text-sm font-bold text-action">مشاوره فنی مواد پلیمری و رزین</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.7] md:text-4xl">برای انتخاب گرید مناسب، <span className="text-action">با هم بررسی می‌کنیم</span></h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-white/80 md:text-base">نیاز تولید یا پروژه‌تان را توضیح دهید. اطلاعات کاربرد، فرایند و مقدار مصرف به بررسی گزینه‌های مناسب کمک می‌کند.</p>
      </div>
    </section>
    <section className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 md:grid-cols-5 md:gap-10 md:py-16">
      <aside className="space-y-6 md:col-span-2">
        <div><p className="text-sm font-bold text-brand">مراحل مشاوره</p><h2 className="mt-2 text-2xl font-bold">از نیاز تا انتخاب آگاهانه</h2></div>
        <ol className="space-y-5">
          {steps.map((step) => <li key={step.n} className="flex gap-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{step.n}</span><div><h3 className="font-bold">{step.title}</h3><p className="mt-1 text-sm leading-7 text-ink/70">{step.text}</p></div></li>)}
        </ol>
        <div className="rounded-2xl border border-line bg-white p-5"><h3 className="font-bold">چه اطلاعاتی مفید است؟</h3><ul className="mt-3 space-y-2 text-sm leading-7 text-ink/75"><li>• محصول نهایی و کاربرد آن</li><li>• روش تولید مانند تزریق، اکستروژن یا پوشش</li><li>• خواص مهم مانند استحکام، انعطاف یا مقاومت شیمیایی</li><li>• مقدار مصرف و شرایط فرایند</li></ul></div>
        <p className="text-sm leading-7 text-ink/65">سؤال کوتاه‌تری دارید؟ از <Link href="/contact" className="font-bold text-brand underline">صفحه تماس با ما</Link> برای ارتباط مستقیم استفاده کنید.</p>
      </aside>
      <div className="md:col-span-3"><ConsultationForm /></div>
    </section>
  </>;
}
