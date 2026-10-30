import { NextResponse } from "next/server";
import { digits, safeNext, sessionCookie, sessionFor } from "@/lib/auth";
import { getUsers, makePasswordHash, newUserId, saveUsers, type ManagedUser } from "@/lib/users-store";
import { normalizeMobile, verifyOtp } from "@/lib/otp-store";
import { randomElementAvatar } from "@/lib/avatars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const mobile = normalizeMobile(body?.mobile);
  const otp = digits(String(body?.otp ?? "").trim());
  if (!mobile || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "شماره موبایل یا رمز یک‌بارمصرف معتبر نیست." }, { status: 400 });
  }

  const result = verifyOtp(mobile, otp);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason === "expired" ? "زمان اعتبار رمز تمام شده است؛ دوباره رمز بگیرید." : "رمز یک‌بارمصرف درست نیست یا منقضی شده است." }, { status: 401 });
  }

  const users = await getUsers();
  let user = users.find((u) => u.mobile === mobile);
  const isNew = !user;
  if (!user) {
    user = {
      id: newUserId(), username: mobile, name: `کاربر ${mobile}`, email: "", mobile, company: "",
      role: "buyer", active: true, avatar: randomElementAvatar(), passwordHash: makePasswordHash(newUserId()), createdAt: new Date().toISOString(),
    } satisfies ManagedUser;
    users.unshift(user);
    await saveUsers(users);
  }
  if (!user.active || user.role !== "buyer") return NextResponse.json({ error: "ورود با رمز یک‌بارمصرف برای این شماره امکان‌پذیر نیست." }, { status: 403 });

  const remember = !!body?.remember;
  const res = NextResponse.json({ redirect: isNew ? "/dashboard/profile" : safeNext(body?.next, user.role) });
  res.cookies.set(sessionCookie(sessionFor(user, remember), remember));
  return res;
}
