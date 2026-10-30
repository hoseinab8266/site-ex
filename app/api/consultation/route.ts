import { NextResponse } from "next/server";
import { addMessage } from "@/lib/messages-store";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`consult:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "تعداد درخواست‌های ارسالی زیاد بود. چند دقیقه دیگر دوباره تلاش کنید." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const product = String(body?.product ?? "").trim();
  const application = String(body?.application ?? "").trim();
  if (name.length < 2 || phone.length < 7 || !product || application.length < 3) {
    return NextResponse.json({ error: "نام، شماره تماس، دسته محصول و کاربرد را کامل وارد کنید." }, { status: 400 });
  }

  const message = await addMessage({
    kind: "consultation",
    name,
    phone,
    email: String(body?.email ?? "").trim(),
    company: String(body?.company ?? "").trim(),
    product,
    application,
    quantity: String(body?.quantity ?? "").trim(),
    bestTime: String(body?.bestTime ?? "").trim(),
    text: String(body?.text ?? "").trim(),
  });
  return NextResponse.json({ ok: true, id: message.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
