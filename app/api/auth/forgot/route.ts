import { NextResponse } from "next/server";
import { getUsers } from "@/lib/users-store";
import { allowOtpSend, createOtp, clearOtp, normalizeMobile } from "@/lib/otp-store";
import { sendBaleOtp } from "@/lib/bale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// پاسخ همیشه یکسان است تا وجود یا نبود حساب لو نرود.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = normalizeMobile(body?.mobile);

  // شمارهٔ نامعتبر هم پیام یکسان می‌گیرد؛ فقط رمزی ارسال نمی‌شود.
  if (!mobile) return NextResponse.json({ ok: true });

  const gate = allowOtpSend(mobile);
  if (!gate.ok) {
    const error = gate.reason === "cooldown"
      ? `لطفاً ${gate.retryAfter} ثانیه دیگر دوباره درخواست رمز دهید.`
      : "برای این شماره درخواست‌های زیادی ثبت شده است. یک ساعت دیگر دوباره تلاش کنید.";
    return NextResponse.json({ error }, { status: 429, headers: { "Retry-After": String(gate.retryAfter) } });
  }

  const users = await getUsers();
  const user = users.find((u) => u.mobile === mobile);

  // فقط حساب‌های فعال مشتری رمز بازیابی می‌گیرند؛ بقیه بی‌صدا رد می‌شوند.
  if (!user || !user.active || user.role !== "buyer") return NextResponse.json({ ok: true });

  const { otp } = createOtp(mobile);
  try {
    await sendBaleOtp(mobile, otp);
  } catch (error) {
    clearOtp(mobile); // رمز تحویل‌نشده نباید معتبر بماند
    console.error("Bale password reset send failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "ارسال رمز از طریق بله انجام نشد. تنظیمات سفیر، اعتبار حساب و وضعیت شماره را بررسی کنید." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
