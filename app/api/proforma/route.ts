import { NextResponse } from "next/server";
import { getSession, getSessionUser } from "@/lib/auth";
import { createProforma, getProformas } from "@/lib/proformas-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

// GET: خریدار پیش‌فاکتورهای خودش، کارکنان همه.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const all = await getProformas();
  const mine = session.role === "buyer" ? all.filter((p) => p.userId === session.uid) : all;
  return NextResponse.json({ proformas: mine }, { headers: noStore });
}

// POST: ثبت درخواست پیش‌فاکتور جدید توسط خریدار.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "buyer") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? "").trim();
  const qty = Math.floor(Number(body?.qty));
  if (!slug || !Number.isFinite(qty) || qty < 1) return NextResponse.json({ error: "محصول و مقدار معتبر را انتخاب کنید." }, { status: 400 });

  const user = await getSessionUser(session);
  const proforma = await createProforma({
    userId: session.uid ?? "",
    customer: user?.company || user?.name || "مشتری",
    slug,
    qty,
    note: String(body?.note ?? "").trim(),
  });
  if (!proforma) return NextResponse.json({ error: "محصول انتخابی پیدا نشد." }, { status: 404 });
  return NextResponse.json({ proforma }, { status: 201, headers: noStore });
}
