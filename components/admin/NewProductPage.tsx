"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProductVisual from "@/components/ProductVisual";
import { families } from "@/lib/data";

const input = "w-full rounded-xl border border-line bg-white px-3 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10";
const label = "mb-1.5 block text-sm font-bold";
type FormState = {
  slug: string; badge: string; name: string; summary: string; price: string; unit: string;
  imageUrl: string; family: string; specsText: string; description: string;
  applications: string; storage: string; packSize: string; packLabel: string; extraSpecsText: string;
  stockStatus: "available" | "out_of_stock" | "contact"; stockQuantity: string;
};
const blank: FormState = {
  slug: "", badge: "", name: "", summary: "", price: "", unit: "کیلوگرم", imageUrl: "", family: "",
  specsText: "", description: "", applications: "", storage: "", packSize: "1", packLabel: "", extraSpecsText: "",
  stockStatus: "available", stockQuantity: "0",
};
function parseSpecs(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
    const i = line.indexOf(":");
    return i < 0 ? { label: line, value: "" } : { label: line.slice(0, i).trim(), value: line.slice(i + 1).trim() };
  });
}
function Field({ title, value, onChange, placeholder, required = false, type = "text", dir }: {
  title: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; dir?: "ltr" | "rtl";
}) {
  return <label className="block"><span className={label}>{title}{required && <span className="ms-1 text-rose-600">*</span>}</span><input className={input} value={value} type={type} dir={dir} required={required} min={type === "number" ? 0 : undefined} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
function Area({ title, value, onChange, placeholder, rows = 4 }: { title: string; value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  return <label className="block"><span className={label}>{title}</span><textarea className={input} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(blank);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const set = (key: keyof FormState, value: string) => setForm((old) => ({ ...old, [key]: value }));
  const specs = useMemo(() => parseSpecs(form.specsText), [form.specsText]);
  const extraSpecs = useMemo(() => parseSpecs(form.extraSpecsText), [form.extraSpecsText]);
  const faPrice = Number(form.price || 0).toLocaleString("fa-IR");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const item = {
      slug: form.slug.trim().toLowerCase(), badge: form.badge.trim() || "NEW", name: form.name.trim(), summary: form.summary.trim(),
      price: Number(form.price), unit: form.unit.trim() || "کیلوگرم", imageUrl: form.imageUrl.trim(), family: form.family,
      specs, description: form.description.split("\n").map((x) => x.trim()).filter(Boolean),
      applications: form.applications.split("\n").map((x) => x.trim()).filter(Boolean), storage: form.storage.trim(),
      packSize: Number(form.packSize) || 1, packLabel: form.packLabel.trim() || form.unit.trim(), extraSpecs,
      stockStatus: form.stockStatus, stockQuantity: form.stockStatus === "available" ? Math.max(0, Number(form.stockQuantity) || 0) : 0,
    };
    try {
      const response = await fetch("/api/admin/catalog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: "products", item }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ذخیره محصول انجام نشد.");
      router.push(`/products/${item.slug}`); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارتباط با سرور برقرار نشد.");
    } finally { setBusy(false); }
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploadError("");
    if (!file.type.startsWith("image/")) { setUploadError("لطفاً یک فایل تصویری انتخاب کنید."); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("حجم تصویر باید حداکثر ۵ مگابایت باشد."); return; }
    setUploading(true);
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "آپلود تصویر انجام نشد.");
      set("imageUrl", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "آپلود تصویر انجام نشد.");
    } finally { setUploading(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-6 pb-12">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm text-ink/60"><Link href="/admin">مدیریت</Link> / <Link href="/admin/products">محصولات</Link> / افزودن محصول</p><h1 className="mt-2 text-2xl font-bold md:text-3xl">افزودن محصول جدید</h1><p className="mt-2 text-sm leading-7 text-ink/70">اطلاعات را در فرم وارد کن؛ پیش‌نمایش سمت چپ هم‌زمان با تایپ به‌روزرسانی می‌شود.</p></div>
      <Link href="/admin/products" className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-paper">بازگشت به محصولات</Link>
    </div>
    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
    <form onSubmit={submit} className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        {/* Live preview is deliberately styled like the public product detail page. */}
        <div className="order-2 space-y-5 lg:order-1">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <div className="relative">
              {form.imageUrl.trim() ? <div className="flex h-72 items-center justify-center bg-paper md:h-[26rem]"><img src={form.imageUrl} alt="پیش‌نمایش محصول" className="h-full w-full object-cover" /></div> : <div className="[&_svg]:h-72 md:[&_svg]:h-[26rem]"><ProductVisual kind={form.badge || "NEW"} /></div>}
              <span dir="ltr" className="absolute start-4 top-4 rounded-sm bg-ink px-2.5 py-1 text-xs font-bold text-white">{form.badge || "NEW"}</span>
            </div>
            <dl className="grid min-h-16 grid-cols-3 divide-x divide-line border-t border-line bg-paper text-sm">
              {specs.slice(0, 3).map((s, i) => <div key={`${s.label}-${i}`} className="px-2 py-3 text-center"><dt className="text-xs text-ink/70">{s.label}</dt><dd className="mt-1 break-words font-bold">{s.value || "—"}</dd></div>)}
              {!specs.length && <div className="col-span-3 px-3 py-5 text-center text-xs text-ink/50">سه مشخصه کلیدی محصول در این قسمت نمایش داده می‌شود</div>}
            </dl>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            {form.family && <p className="text-sm text-brand">{families.find((x) => x.slug === form.family)?.name}</p>}
            <h2 className="mt-1 text-2xl font-bold leading-[1.8] md:text-3xl">{form.name || "نام محصول"}</h2>
            <p className="mt-3 leading-8 text-ink/75">{form.summary || "توضیح کوتاه محصول پس از وارد کردن، در این بخش نمایش داده می‌شود."}</p>
            <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
              <p><strong className="text-3xl">{faPrice}</strong> <span className="text-sm text-ink/70">تومان / {form.unit || "واحد"}</span></p>
              <p className="mt-4 text-sm text-ink/70">بسته‌بندی: {form.packLabel || "—"}</p>
              <p className={`mt-3 text-sm font-bold ${form.stockStatus === "available" && Number(form.stockQuantity) > 0 ? "text-emerald-700" : form.stockStatus === "contact" ? "text-amber-700" : "text-rose-700"}`}>
                {form.stockStatus === "contact" ? "برای استعلام موجودی تماس بگیرید" : form.stockStatus === "out_of_stock" ? "ناموجود" : Number(form.stockQuantity) > 0 ? `موجود · ${Number(form.stockQuantity).toLocaleString("fa-IR")} واحد` : "موجودی صفر است"}
              </p>
              <button type="button" disabled className="mt-5 w-full rounded-xl bg-brand px-4 py-3.5 font-bold text-white opacity-70">پیش‌نمایش وضعیت خرید</button>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="border-s-4 border-action ps-3 text-xl font-bold">درباره این گرید</h2>
            <div className="mt-4 space-y-3 leading-8 text-ink/80">{form.description.split("\n").filter((x) => x.trim()).map((x, i) => <p key={i}>{x}</p>)}{!form.description.trim() && <p className="text-ink/45">توضیحات کامل محصول اینجا نمایش داده می‌شود.</p>}</div>
            {form.applications.trim() && <><h3 className="mt-6 font-bold">کاربردها</h3><ul className="mt-2 list-inside list-disc space-y-2 text-sm">{form.applications.split("\n").filter((x) => x.trim()).map((x, i) => <li key={i}>{x}</li>)}</ul></>}
            {form.storage.trim() && <><h3 className="mt-6 font-bold">نگهداری</h3><p className="mt-2 leading-8 text-ink/80">{form.storage}</p></>}
            <h3 className="mt-6 font-bold">مشخصات فنی</h3><dl className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line text-sm">{[...specs, ...extraSpecs].map((s, i) => <div key={`${s.label}-${i}`} className={`flex justify-between gap-4 px-4 py-3 ${i % 2 === 0 ? "bg-paper" : "bg-white"}`}><dt className="text-ink/70">{s.label}</dt><dd className="text-end font-medium">{s.value}</dd></div>)}{!specs.length && !extraSpecs.length && <p className="p-4 text-ink/45">مشخصات فنی هنوز وارد نشده است.</p>}</dl>
          </div>
        </div>

        <div className="order-1 space-y-5 lg:order-2">
          <section className="space-y-4 rounded-2xl border border-line bg-white p-5 md:p-6">
            <div><h2 className="text-lg font-bold">اطلاعات اصلی محصول</h2><p className="mt-1 text-sm text-ink/60">موارد ستاره‌دار برای ثبت محصول الزامی هستند.</p></div>
            <Field title="نام محصول" value={form.name} onChange={(v) => set("name", v)} placeholder="مثلاً پلی‌اتیلن سنگین گرید لوله" required />
            <Field title="شناسه انگلیسی (Slug)" value={form.slug} onChange={(v) => set("slug", v.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase())} placeholder="مثلاً hdpe-pipe-grade" dir="ltr" required />
            <div className="grid gap-4 sm:grid-cols-2"><Field title="کد یا نشان محصول" value={form.badge} onChange={(v) => set("badge", v)} placeholder="HDPE" /><Field title="قیمت (تومان)" value={form.price} onChange={(v) => set("price", v)} type="number" placeholder="98000" required /></div>
            <div className="grid gap-4 sm:grid-cols-2"><Field title="واحد فروش" value={form.unit} onChange={(v) => set("unit", v)} placeholder="کیلوگرم" /><Field title="تعداد واحد در بسته" value={form.packSize} onChange={(v) => set("packSize", v)} type="number" placeholder="25" /></div>
            <Field title="عنوان بسته‌بندی" value={form.packLabel} onChange={(v) => set("packLabel", v)} placeholder="مثلاً کیسه ۲۵ کیلوگرمی" />
            <label className="block"><span className={label}>دسته‌بندی</span><select className={input} value={form.family} onChange={(e) => set("family", e.target.value)}><option value="">انتخاب دسته‌بندی</option>{families.map((family) => <option key={family.slug} value={family.slug}>{family.name}</option>)}</select></label>
            <div className="space-y-3">
              <label className="block"><span className={label}>آپلود تصویر محصول</span><input type="file" accept="image/*" className={`${input} file:me-3 file:rounded-lg file:border-0 file:bg-brand-soft file:px-3 file:py-2`} disabled={uploading} onChange={(e) => { void uploadImage(e.target.files?.[0]); e.currentTarget.value = ""; }} /><span className="mt-1 block text-xs text-ink/60">فرمت‌های تصویری، حداکثر ۵ مگابایت. تصویر روی سرور سایت ذخیره می‌شود.</span></label>
              {uploading && <p className="text-sm text-brand">در حال آپلود تصویر…</p>}
              {uploadError && <p role="alert" className="text-sm text-rose-700">{uploadError}</p>}
              {form.imageUrl && <div className="flex items-center gap-3"><img src={form.imageUrl} alt="تصویر انتخاب‌شده" className="h-20 w-20 rounded-xl border border-line object-cover" /><div className="min-w-0 flex-1"><p className="break-all text-xs text-ink/60" dir="ltr">{form.imageUrl}</p><button type="button" onClick={() => set("imageUrl", "")} className="mt-1 text-sm font-bold text-rose-700">حذف تصویر</button></div></div>}
              <details><summary className="cursor-pointer text-sm text-ink/70">یا وارد کردن آدرس تصویر (URL)</summary><div className="mt-3"><Field title="آدرس تصویر" value={form.imageUrl} onChange={(v) => set("imageUrl", v)} placeholder="https://example.com/product.jpg" dir="ltr" /></div></details>
            </div>
            <section className="space-y-4 rounded-xl border border-line bg-paper p-4">
              <div><h3 className="font-bold">وضعیت موجودی محصول</h3><p className="mt-1 text-xs leading-6 text-ink/65">وضعیت انتخابی در صفحه عمومی محصول نمایش داده می‌شود.</p></div>
              <label className="block"><span className={label}>وضعیت فروش</span><select className={input} value={form.stockStatus} onChange={(e) => set("stockStatus", e.target.value as FormState["stockStatus"])}><option value="available">موجود — ثبت تعداد موجودی</option><option value="out_of_stock">ناموجود</option><option value="contact">تماس بگیرید</option></select></label>
              {form.stockStatus === "available" && <Field title="تعداد موجودی" value={form.stockQuantity} onChange={(v) => set("stockQuantity", v)} type="number" placeholder="مثلاً 150" />}
            </section>
            <Area title="توضیح کوتاه محصول" value={form.summary} onChange={(v) => set("summary", v)} placeholder="خلاصه‌ای که کنار قیمت محصول نمایش داده می‌شود..." rows={3} />
          </section>
          <section className="space-y-4 rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="text-lg font-bold">توضیحات و مشخصات محصول</h2>
            <Area title="توضیحات کامل" value={form.description} onChange={(v) => set("description", v)} placeholder="هر پاراگراف را در یک خط بنویسید..." rows={6} />
            <Area title="کاربردها (هر مورد در یک خط)" value={form.applications} onChange={(v) => set("applications", v)} placeholder={'تولید لوله\nقطعات صنعتی\nبسته‌بندی'} rows={4} />
            <Area title="مشخصات کلیدی (هر خط: عنوان: مقدار)" value={form.specsText} onChange={(v) => set("specsText", v)} placeholder={'چگالی: ۰٫۹۵۱ g/cm³\nMFI: ۰٫۳ g/10min\nبسته‌بندی: کیسه ۲۵ کیلوگرمی'} rows={4} />
            <Area title="مشخصات فنی تکمیلی (هر خط: عنوان: مقدار)" value={form.extraSpecsText} onChange={(v) => set("extraSpecsText", v)} placeholder={'شکل ظاهری: گرانول\nفرایند پیشنهادی: اکستروژن'} rows={4} />
            <Area title="شرایط نگهداری" value={form.storage} onChange={(v) => set("storage", v)} placeholder="شرایط مناسب انبارداری و نگهداری محصول..." rows={3} />
          </section>
          <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur">
            <button type="submit" disabled={busy} className="btn-action flex-1 rounded-xl px-5 py-3.5 font-bold disabled:opacity-50">{busy ? "در حال ذخیره محصول…" : "ثبت و انتشار محصول"}</button>
            <Link href="/admin/products" className="rounded-xl border border-line px-5 py-3.5 text-sm font-bold">انصراف</Link>
          </div>
        </div>
      </section>
    </form>
  </div>;
}
