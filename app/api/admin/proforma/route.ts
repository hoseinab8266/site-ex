import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getProformas, setProformaState } from "@/lib/proformas-store";
import { proformaStateLabel, type ProformaState } from "@/lib/panel-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
const states = Object.keys(proformaStateLabel) as ProformaState[];

async function staffOnly() {
  const session = await getSession();
  return session && session.role !== "buyer";
}

export async function GET() {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  return NextResponse.json({ proformas: await getProformas() }, { headers: noStore });
}

export async function PATCH(req: Request) {
  if (!(await staffOnly())) return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "").trim();
  const state = String(body?.state ?? "") as ProformaState;
  if (!id || !states.includes(state)) return NextResponse.json({ error: "اطلاعات تغییر وضعیت معتبر نیست." }, { status: 400 });
  const proforma = await setProformaState(id, state);
  if (!proforma) return NextResponse.json({ error: "پیش‌فاکتور پیدا نشد." }, { status: 404 });
  return NextResponse.json({ proforma }, { headers: noStore });
}
