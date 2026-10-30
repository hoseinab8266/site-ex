import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getOrders, setOrderStatus } from "@/lib/orders-store";
import { statusLabel, type Status } from "@/lib/panel-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const statuses = Object.keys(statusLabel) as Status[];

async function staffOnly() {
  const session = await getSession();
  return session && session.role !== "buyer";
}

export async function GET() {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  return NextResponse.json({ orders: await getOrders() }, { headers: noStore });
}

export async function PATCH(req: Request) {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  const status = String(body?.status ?? "") as Status;
  if (!id || !statuses.includes(status)) return NextResponse.json({ error: "اطلاعات تغییر وضعیت معتبر نیست." }, { status: 400 });
  const order = await setOrderStatus(id, status);
  if (!order) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
  return NextResponse.json({ order }, { headers: noStore });
}
