import { NextResponse } from "next/server";
import { strongPass } from "@/lib/auth";
import { getUsers, makePasswordHash, saveUsers } from "@/lib/users-store";
import { normalizeMobile, verifyOtp } from "@/lib/otp-store";
import { digits } from "@/lib/fa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = normalizeMobile(body?.mobile);
  const otp = digits(String(body?.otp ?? "").trim());
  const password = String(body?.password ?? "");
  const confirm = String(body?.confirm ?? "");

  if (!mobile || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "شماره موبایل یا رمز یک‌بارمصرف معتبر نیست." }, { status: 400 });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "رمز جدید و تکرار آن یکسان نیستند." }, { status: 400 });
  }
  if (!strongPass(password)) {
    return NextResponse.json({ error: "رمز جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد." }, { status: 400 });
  }

  const users = await getUsers();
  const index = users.findIndex((u) => u.mobile === mobile);
  if (index < 0 || !users[index].active || users[index].role !== "buyer") {
    return NextResponse.json({ error: "بازیابی رمز برای این شماره امکان‌پذیر نیست." }, { status: 403 });
  }

  const result = verifyOtp(mobile, otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason === "expired" ? "زمان اعتبار رمز تمام شده است؛ دوباره رمز بگیرید." : "رمز یک‌بارمصرف درست نیست یا منقضی شده است." }, { status: 401 });
  }

  users[index] = { ...users[index], passwordHash: makePasswordHash(password) };
  await saveUsers(users);

  return NextResponse.json({ ok: true, redirect: "/login" });
}
