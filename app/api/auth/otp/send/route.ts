import { NextResponse } from "next/server";
import { getUsers } from "@/lib/users-store";
import { allowOtpSend, clearOtp, createOtp, normalizeMobile } from "@/lib/otp-store";
import { sendBaleOtp } from "@/lib/bale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = normalizeMobile(body?.mobile);
  if (!mobile) return NextResponse.json({ error: "شماره موبایل معتبر نیست؛ شماره را با 09 و ۱۱ رقم وارد کنید." }, { status: 400 });

  const gate = allowOtpSend(mobile);
  if (!gate.ok) {
    const error = gate.reason === "cooldown"
      ? `لطفاً ${gate.retryAfter} ثانیه دیگر دوباره درخواست رمز دهید.`
      : "برای این شماره درخواست‌های زیادی ثبت شده است. یک ساعت دیگر دوباره تلاش کنید.";
    return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(gate.retryAfter) } });
  }

  const users = await getUsers();
  const existing = users.find((u) => u.mobile === mobile);
  if (existing && (!existing.active || existing.role !== "buyer")) {
    return NextResponse.json({ error: "ورود با رمز یک‌بارمصرف برای این شماره امکان‌پذیر نیست." }, { status: 403 });
  }

  const { otp } = createOtp(mobile);
  try {
    await sendBaleOtp(mobile, otp);
    return NextResponse.json({ ok: true });
  } catch (error) {
    clearOtp(mobile); // an undelivered code must not stay valid
    console.error("Bale OTP send failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "ارسال رمز از طریق بله انجام نشد. تنظیمات سفیر، اعتبار حساب و وضعیت شماره را بررسی کنید." }, { status: 502 });
  }
}
