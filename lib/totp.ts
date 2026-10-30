import "server-only";
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

// پیاده‌سازی استاندارد TOTP (RFC 6238) برای Google Authenticator و اپ‌های مشابه.
// فقط از node:crypto استفاده می‌کند؛ بدون وابستگی بیرونی.

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** تبدیل بافر به رشته Base32 (بدون padding) */
export function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
  return out;
}

/** تبدیل رشته Base32 به بافر (حساس به حروف کوچک نیست، فاصله و - نادیده گرفته می‌شود) */
export function base32Decode(input: string): Buffer {
  const clean = String(input).toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

/** ساخت کلید مخفی تازه (۲۰ بایت = ۱۶۰ بیت) به‌صورت Base32 */
export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

const PERIOD = 30;
const DIGITS = 6;

/** کد HOTP برای شمارنده مشخص */
export function hotp(secret: Buffer, counter: number, digits = DIGITS): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** digits).padStart(digits, "0");
}

/** کد TOTP برای زمان مشخص (میلی‌ثانیه) */
export function totp(secretB32: string, at: number = Date.now()): string {
  return hotp(base32Decode(secretB32), Math.floor(at / 1000 / PERIOD));
}

/** بررسی کد با پنجره ±یک گام (تحمل ~۳۰ ثانیه اختلاف ساعت) */
export function verifyTotp(secretB32: string, code: string, at: number = Date.now(), window = 1): boolean {
  const clean = String(code ?? "").replace(/\D/g, "");
  if (clean.length !== DIGITS) return false;
  const secret = base32Decode(secretB32);
  if (secret.length === 0) return false;
  const counter = Math.floor(at / 1000 / PERIOD);
  const a = Buffer.from(clean);
  for (let i = -window; i <= window; i++) {
    const b = Buffer.from(hotp(secret, counter + i));
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/** آدرس otpauth:// برای ساخت QR یا ورود دستی در اپ Authenticator */
export function otpauthURL(secret: string, label: string, issuer = "Polyrez"): string {
  const q = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD),
  });
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(label)}?${q.toString()}`;
}

// ---------- کدهای پشتیبان (Backup Codes) ----------

const BACKUP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function backupCode(): string {
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += BACKUP_ALPHABET[randomInt(BACKUP_ALPHABET.length)];
    if (i === 3) out += "-";
  }
  return out;
}

/** ساخت ۱۰ کد پشتیبان یک‌بارمصرف + نسخه هش‌شده برای ذخیره‌سازی */
export function generateBackupCodes(count = 10): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) plain.push(backupCode());
  return { plain, hashed: plain.map(hashBackupCode) };
}

/** هش کردن کد پشتیبان با scrypt (salt:hash) */
export function hashBackupCode(code: string): string {
  const normalized = String(code ?? "").toUpperCase().replace(/[^A-Z2-9]/g, "");
  const salt = randomBytes(8).toString("hex");
  return `${salt}:${scryptSync(normalized, salt, 32).toString("hex")}`;
}

/** بررسی کد پشتیبان؛ در صورت صحیح بودن، ایندکس آن برگردانده می‌شود تا از فهرست حذف شود */
export function matchBackupCode(code: string, hashed: string[]): number {
  const normalized = String(code ?? "").toUpperCase().replace(/[^A-Z2-9]/g, "");
  if (normalized.length !== 8) return -1;
  const actual = Buffer.from(normalized);
  for (let i = 0; i < hashed.length; i++) {
    const [salt, digest] = String(hashed[i]).split(":");
    if (!salt || !digest) continue;
    const expected = scryptSync(normalized, salt, 32);
    if (Buffer.from(digest, "hex").equals(expected) && actual.length > 0) return i;
  }
  return -1;
}
