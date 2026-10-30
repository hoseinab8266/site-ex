import { NextResponse } from "next/server";
import { findOrder } from "@/lib/orders-store";
import { statusLabel } from "@/lib/panel-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// رهگیری عمومی سفارش با شمارهٔ سفارش؛ فقط وضعیت و اقلام، بدون اطلاعات کاربر دیگران.
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const order = await findOrder(id);
  if (!order) return NextResponse.json({ error: "سفارشی با این شماره پیدا نشد." }, { status: 404 });
  return NextResponse.json(
    {
      order: {
        id: order.id,
        date: order.date,
        item: order.item,
        qty: order.qty,
        total: order.total,
        status: order.status,
        statusLabel: statusLabel[order.status].label,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
