import { NextResponse } from "next/server";
import { getSession, getSessionUser } from "@/lib/auth";
import { createOrder, getOrders } from "@/lib/orders-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

// GET: خریدار فقط سفارش‌های خودش را می‌بیند، کارکنان همه را.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const all = await getOrders();
  const mine = session.role === "buyer" ? all.filter((o) => o.userId === session.uid) : all;
  return NextResponse.json({ orders: mine }, { headers: noStore });
}

// POST: ساخت سفارش جدید؛ مبالغ در سرور محاسبه می‌شود.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "buyer") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];
  const clean = items
    .map((i: { slug?: unknown; qty?: unknown }) => ({ slug: String(i?.slug ?? ""), qty: Math.floor(Number(i?.qty)) }))
    .filter((i: { slug: string; qty: number }) => i.slug && Number.isFinite(i.qty) && i.qty > 0)
    .slice(0, 20);
  if (clean.length === 0) return NextResponse.json({ error: "سبد سفارش خالی است." }, { status: 400 });

  const user = await getSessionUser(session);
  const customer = String(body?.customer ?? "").trim() || user?.company || user?.name || "مشتری";
  const order = await createOrder({
    userId: session.uid ?? "",
    customer,
    mobile: String(body?.mobile ?? "").trim() || user?.mobile || "",
    note: String(body?.note ?? "").trim(),
    items: clean,
  });
  if (!order) return NextResponse.json({ error: "هیچ‌کدام از اقلام انتخابی معتبر نبود." }, { status: 400 });
  return NextResponse.json({ order }, { status: 201, headers: noStore });
}
