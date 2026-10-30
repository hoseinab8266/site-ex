import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCatalog, saveCatalog, type Catalog } from "@/lib/catalog-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isManager() {
  const session = await getSession();
  return session?.role === "manager";
}

export async function GET() {
  if (!(await isManager())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  return NextResponse.json(await getCatalog(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!(await isManager())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !["products", "articles"].includes(body.collection) || !body.item || typeof body.item !== "object") {
    return NextResponse.json({ error: "اطلاعات ارسالی معتبر نیست." }, { status: 400 });
  }
  const collection = body.collection as "products" | "articles";
  const item = body.item as Record<string, unknown>;
  const slug = String(item.slug ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return NextResponse.json({ error: "شناسه انگلیسی معتبر وارد کنید (مثلاً hdpe-pipe-grade)." }, { status: 400 });
  if (collection === "products") {
    if (!String(item.name ?? "").trim() || !String(item.summary ?? "").trim() || !Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
      return NextResponse.json({ error: "نام، توضیح کوتاه و قیمت معتبر الزامی است." }, { status: 400 });
    }
  } else if (!String(item.title ?? "").trim() || !String(item.excerpt ?? "").trim() || !String(item.category ?? "").trim()) {
    return NextResponse.json({ error: "عنوان، خلاصه و دسته‌بندی مقاله الزامی است." }, { status: 400 });
  }
  const catalog = await getCatalog();
  const list = catalog[collection] as Array<Record<string, unknown>>;
  const oldIndex = list.findIndex((x) => x.slug === slug);
  const normalized = collection === "products" ? {
    slug, badge: String(item.badge ?? "NEW").trim(), name: String(item.name).trim(), summary: String(item.summary).trim(),
    specs: Array.isArray(item.specs) ? item.specs : [], price: Number(item.price), unit: String(item.unit ?? "کیلوگرم").trim(),
    imageUrl: String(item.imageUrl ?? "").trim(), family: String(item.family ?? "").trim(),
    description: Array.isArray(item.description) ? item.description.map((x) => String(x).trim()).filter(Boolean) : [],
    applications: Array.isArray(item.applications) ? item.applications.map((x) => String(x).trim()).filter(Boolean) : [],
    extraSpecs: Array.isArray(item.extraSpecs) ? item.extraSpecs : [], storage: String(item.storage ?? "").trim(),
    packSize: Math.max(0.001, Number(item.packSize) || 1), packLabel: String(item.packLabel ?? item.unit ?? "کیلوگرم").trim(),
    stockStatus: ["available", "out_of_stock", "contact"].includes(String(item.stockStatus)) ? item.stockStatus : "available",
    stockQuantity: String(item.stockStatus ?? "available") === "available" ? Math.max(0, Math.floor(Number(item.stockQuantity) || 0)) : 0,
  } : {
    slug, title: String(item.title).trim(), excerpt: String(item.excerpt).trim(), category: String(item.category).trim(),
    readMinutes: Math.max(1, Number(item.readMinutes) || 5), date: String(item.date ?? new Date().toLocaleDateString("fa-IR")).trim(),
    body: String(item.body ?? "").trim(), published: item.published !== false,
  };
  if (oldIndex >= 0 && body.replace !== true) return NextResponse.json({ error: "این شناسه قبلاً ثبت شده است." }, { status: 409 });
  if (oldIndex >= 0) list[oldIndex] = normalized;
  else list.unshift(normalized);
  catalog[collection] = list as never;
  await saveCatalog(catalog);
  return NextResponse.json({ ok: true, catalog });
}

export async function PUT(req: Request) {
  if (!(await isManager())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !["products", "articles"].includes(body.collection) || !body.item?.slug) return NextResponse.json({ error: "اطلاعات ویرایش معتبر نیست." }, { status: 400 });
  const catalog = await getCatalog();
  const collection = body.collection as "products" | "articles";
  const slug = String(body.item.slug);
  const list = catalog[collection] as Array<Record<string, unknown>>;
  const index = list.findIndex((x) => x.slug === slug);
  if (index < 0) return NextResponse.json({ error: "موردی با این شناسه پیدا نشد." }, { status: 404 });
  const item = body.item as Record<string, unknown>;
  const normalized = collection === "products" ? {
    slug, badge: String(item.badge ?? "NEW"), name: String(item.name ?? "").trim(), summary: String(item.summary ?? "").trim(),
    specs: Array.isArray(item.specs) ? item.specs : [], price: Number(item.price), unit: String(item.unit ?? "کیلوگرم").trim(),
    imageUrl: String(item.imageUrl ?? "").trim(), family: String(item.family ?? "").trim(),
    description: Array.isArray(item.description) ? item.description.map((x) => String(x).trim()).filter(Boolean) : [],
    applications: Array.isArray(item.applications) ? item.applications.map((x) => String(x).trim()).filter(Boolean) : [],
    extraSpecs: Array.isArray(item.extraSpecs) ? item.extraSpecs : [], storage: String(item.storage ?? "").trim(),
    packSize: Math.max(0.001, Number(item.packSize) || 1), packLabel: String(item.packLabel ?? item.unit ?? "کیلوگرم").trim(),
    stockStatus: ["available", "out_of_stock", "contact"].includes(String(item.stockStatus)) ? item.stockStatus : "available",
    stockQuantity: String(item.stockStatus ?? "available") === "available" ? Math.max(0, Math.floor(Number(item.stockQuantity) || 0)) : 0,
  } : {
    slug, title: String(item.title ?? "").trim(), excerpt: String(item.excerpt ?? "").trim(), category: String(item.category ?? "").trim(),
    readMinutes: Math.max(1, Number(item.readMinutes) || 5), date: String(item.date ?? "").trim(), body: String(item.body ?? "").trim(), published: item.published !== false,
  };
  if (collection === "products" && (!normalized.name || !normalized.summary || !Number.isFinite(normalized.price) || normalized.price < 0)) return NextResponse.json({ error: "اطلاعات محصول کامل نیست." }, { status: 400 });
  if (collection === "articles" && (!normalized.title || !normalized.excerpt || !normalized.category)) return NextResponse.json({ error: "عنوان، خلاصه و دسته‌بندی مقاله الزامی است." }, { status: 400 });
  list[index] = normalized;
  catalog[collection] = list as never;
  await saveCatalog(catalog);
  return NextResponse.json({ ok: true, catalog });
}

export async function DELETE(req: Request) {
  if (!(await isManager())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || !["products", "articles"].includes(body.collection) || !body.slug) return NextResponse.json({ error: "اطلاعات حذف معتبر نیست." }, { status: 400 });
  const catalog = await getCatalog();
  const collection = body.collection as "products" | "articles";
  catalog[collection] = catalog[collection].filter((item) => item.slug !== String(body.slug)) as never;
  await saveCatalog(catalog);
  return NextResponse.json({ ok: true, catalog });
}
