import "server-only";
import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";

export type ManagedRole = "manager" | "member" | "buyer";
export type ManagedUser = {
  id: string; username: string; name: string; email: string; mobile: string; company: string;
  role: ManagedRole; active: boolean; avatar: string; passwordHash: string; createdAt: string;
  nationalId?: string; economicCode?: string; address?: string;
  // ورود دومرحله‌ای (Google Authenticator)
  totpSecret?: string; // تا زمان تأیید، «در انتظار فعال‌سازی» است
  totpEnabled?: boolean;
  totpConfirmedAt?: string;
  backupCodes?: string[]; // کدهای پشتیبان هش‌شده (یک‌بارمصرف)
  lastLoginAt?: string;
};
const file = path.join(process.cwd(), "data", "users.json");
const hashPassword = (password: string, salt: string = randomUUID()) => `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
export function verifyPassword(password: string, stored: string) {
  const [salt, digest] = String(stored).split(":");
  if (!salt || !digest) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(digest, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function makePasswordHash(password: string) { return hashPassword(password); }
const seed = (): ManagedUser[] => {
  const now = new Date().toISOString();
  return [
    { id: "seed-admin", username: process.env.ADMIN_USERNAME || (process.env.NODE_ENV !== "production" ? "admin" : "__admin_not_configured__"), name: process.env.ADMIN_DISPLAY_NAME || "مدیر سایت", email: "", mobile: "", company: "", role: "manager", active: true, avatar: "", passwordHash: hashPassword(process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "Polyrez@1405" : "__admin_not_configured__"), "polyrez-admin-seed"), createdAt: now },
    { id: "seed-sales", username: "sales", name: "کارشناس فروش", email: "sales1@polyrez.ir", mobile: "", company: "", role: "member", active: true, avatar: "", passwordHash: hashPassword("Sales@1405", "polyrez-sales-seed"), createdAt: now },
    { id: "seed-buyer", username: "09120000000", name: "مهدی رضایی", email: "", mobile: "09120000000", company: "", role: "buyer", active: true, avatar: "", passwordHash: hashPassword("Buyer@1405", "polyrez-buyer-seed"), createdAt: now },
  ];
};
export async function getUsers(): Promise<ManagedUser[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) return parsed as ManagedUser[];
  } catch { /* initialize below */ }
  const initial = seed();
  await saveUsers(initial);
  return initial;
}
export async function saveUsers(users: ManagedUser[]) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(users, null, 2), { encoding: "utf8", mode: 0o600 });
  await rename(temp, file);
}
export function newUserId() { return randomUUID(); }
