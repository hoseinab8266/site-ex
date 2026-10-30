import { NextResponse } from "next/server";
import { addMessage } from "@/lib/messages-store";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "تعداد پیام‌های ارسالی زیاد بود. چند دقیقه دیگر دوباره تلاش کنید." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const subject = String(body?.subject ?? "").trim();
  const text = String(body?.text ?? "").trim();
  if (name.length < 2 || phone.length < 7 || !subject || text.length < 5) {
    return NextResponse.json({ error: "نام، شماره تماس، موضوع و متن پیام را کامل وارد کنید." }, { status: 400 });
  }

  const message = await addMessage({
    kind: "contact",
    name,
    phone,
    email: String(body?.email ?? "").trim(),
    subject,
    text,
  });
  return NextResponse.json({ ok: true, id: message.id }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
