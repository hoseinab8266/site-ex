import "server-only";

// محدودکنندهٔ سادهٔ درخواست در حافظهٔ سرور؛ برای استقرار چندنمونه‌ای باید با Redis جایگزین شود.
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
