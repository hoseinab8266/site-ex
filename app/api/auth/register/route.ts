import { NextResponse } from "next/server";
import { MOBILE, digits, sessionCookie, sessionFor, strongPass } from "@/lib/auth";
import { getUsers, saveUsers, makePasswordHash, newUserId, type ManagedUser } from "@/lib/users-store";
import { randomElementAvatar } from "@/lib/avatars";

export const runtime = "nodejs";
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? "").trim();
  const mobile = digits(String(b?.mobile ?? "").trim());
  const pass = String(b?.password ?? "");
  const company = String(b?.company ?? "").trim();
  if (name.length < 3) return NextResponse.json({ error: "نام و نام خانوادگی را کامل وارد کنید." }, { status: 400 });
  if (!MOBILE.test(mobile)) return NextResponse.json({ error: "شماره موبایل معتبر نیست (مثال: ۰۹۱۲۰۰۰۰۰۰۰)." }, { status: 400 });
  if (!strongPass(pass)) return NextResponse.json({ error: "رمز عبور حداقل ۸ کاراکتر و شامل حرف و عدد باشد." }, { status: 400 });
  if (pass !== String(b?.confirm ?? "")) return NextResponse.json({ error: "تکرار رمز عبور یکسان نیست." }, { status: 400 });
  if (!b?.terms) return NextResponse.json({ error: "پذیرش قوانین و مقررات الزامی است." }, { status: 400 });
  const users = await getUsers();
  if (users.some(u => u.mobile === mobile || u.username.toLowerCase() === mobile.toLowerCase())) return NextResponse.json({ error: "با این شماره موبایل قبلاً حساب ساخته شده است." }, { status: 409 });
  const user: ManagedUser = { id: newUserId(), username: mobile, name, email: "", mobile, company, role: "buyer", active: true, avatar: randomElementAvatar(), passwordHash: makePasswordHash(pass), createdAt: new Date().toISOString() };
  users.unshift(user);
  await saveUsers(users);
  const res = NextResponse.json({ redirect: "/dashboard" });
  res.cookies.set(sessionCookie(sessionFor(user, true), true));
  return res;
}
