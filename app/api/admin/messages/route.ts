import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMessages, removeMessage, setMessageRead } from "@/lib/messages-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };

async function staffOnly() {
  const session = await getSession();
  return session && session.role !== "buyer";
}

export async function GET() {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  return NextResponse.json({ messages: await getMessages() }, { headers: noStore });
}

export async function PATCH(req: Request) {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "شناسهٔ پیام معتبر نیست." }, { status: 400 });
  const message = await setMessageRead(id, body?.read !== false);
  if (!message) return NextResponse.json({ error: "پیام پیدا نشد." }, { status: 404 });
  return NextResponse.json({ message }, { headers: noStore });
}

export async function DELETE(req: Request) {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "شناسهٔ پیام معتبر نیست." }, { status: 400 });
  const ok = await removeMessage(id);
  if (!ok) return NextResponse.json({ error: "پیام پیدا نشد." }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: noStore });
}
