import "server-only";
import { randomUUID } from "node:crypto";

type BaleSendResponse = {
  error_data?: Array<{ code?: number; description?: string; phone_number?: string }> | null;
};

/** Send an OTP through Bale Safir. Keep this function server-only. */
export async function sendBaleOtp(phone: string, otp: string) {
  const apiKey = process.env.BALE_SAFIR_ACCESS_KEY;
  const botId = Number(process.env.BALE_BOT_ID);
  if (!apiKey || !Number.isInteger(botId) || botId <= 0) {
    throw new Error("تنظیمات سرویس سفیر بله کامل نیست.");
  }

  // Safir expects Iranian mobile numbers as 98xxxxxxxxxx (no + sign).
  const phoneNumber = `98${phone.slice(1)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch("https://safir.bale.ai/api/v3/send_message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-access-key": apiKey,
      },
      body: JSON.stringify({
        request_id: randomUUID(),
        bot_id: botId,
        phone_number: phoneNumber,
        message_data: { otp_message: { otp } },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({})) as BaleSendResponse;
    if (!response.ok || (Array.isArray(result.error_data) && result.error_data.length > 0)) {
      // Never expose provider details or secrets to the browser (dev console only).
      if (process.env.NODE_ENV !== "production") console.error("[Bale Safir]", response.status, JSON.stringify(result));
      throw new Error("ارسال رمز از طریق بله ناموفق بود.");
    }
    // The sample request/response contract does not require a message_id.
    return true;
  } finally {
    clearTimeout(timeout);
  }
}
