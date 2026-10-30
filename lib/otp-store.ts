import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";

type OtpRecord = { hash: string; expiresAt: number; attempts: number; lastSentAt: number };
const codes = new Map<string, OtpRecord>();
const sendWindows = new Map<string, { count: number; startedAt: number; lastAt: number }>();

function digest(phone: string, otp: string) {
  const secret = process.env.OTP_SECRET || process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") throw new Error("OTP_SECRET تنظیم نشده است");
  return createHash("sha256").update(`${secret || "development-only-secret"}:${phone}:${otp}`).digest();
}

export function normalizeMobile(value: unknown) {
  const s = String(value ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[\s()-]/g, "");
  if (/^\+?98\d{10}$/.test(s)) {
    const local = `0${s.replace(/^\+?98/, "")}`;
    return /^09\d{9}$/.test(local) ? local : "";
  }
  return /^09\d{9}$/.test(s) ? s : "";
}

const RESEND_COOLDOWN_MS = 60_000;
const MAX_SENDS_PER_HOUR = 5;

/** Per-phone rate limit: one send per 60s and at most 5 per hour (applies to unknown numbers too, so responses never reveal accounts). */
export function allowOtpSend(phone: string):
  | { ok: true }
  | { ok: false; reason: "cooldown" | "limit"; retryAfter: number } {
  const now = Date.now();
  const prev = sendWindows.get(phone);
  if (!prev || now - prev.startedAt > 60 * 60_000) {
    sendWindows.set(phone, { count: 1, startedAt: now, lastAt: now });
    return { ok: true };
  }
  if (now - prev.lastAt < RESEND_COOLDOWN_MS) {
    return { ok: false, reason: "cooldown", retryAfter: Math.ceil((RESEND_COOLDOWN_MS - (now - prev.lastAt)) / 1000) };
  }
  if (prev.count >= MAX_SENDS_PER_HOUR) {
    return { ok: false, reason: "limit", retryAfter: Math.ceil((prev.startedAt + 60 * 60_000 - now) / 1000) };
  }
  prev.count += 1;
  prev.lastAt = now;
  return { ok: true };
}

export function createOtp(phone: string) {
  const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
  codes.set(phone, { hash: digest(phone, otp).toString("hex"), expiresAt: Date.now() + 5 * 60_000, attempts: 0, lastSentAt: Date.now() });
  return { otp };
}

export function clearOtp(phone: string) {
  codes.delete(phone);
}

export function verifyOtp(phone: string, otp: string) {
  const record = codes.get(phone);
  if (!record) return { ok: false as const, reason: "invalid" as const };
  if (record.expiresAt <= Date.now()) {
    codes.delete(phone);
    return { ok: false as const, reason: "expired" as const };
  }
  record.attempts += 1;
  if (record.attempts > 5) {
    codes.delete(phone);
    return { ok: false as const, reason: "invalid" as const };
  }
  const expected = Buffer.from(record.hash, "hex");
  const actual = digest(phone, otp);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    if (record.attempts >= 5) codes.delete(phone);
    return { ok: false as const, reason: "invalid" as const };
  }
  codes.delete(phone);
  return { ok: true as const };
}
