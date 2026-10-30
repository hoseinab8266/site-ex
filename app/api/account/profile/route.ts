import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, getSessionUser, sessionCookie, sessionFor, MOBILE } from "@/lib/auth";
import { digits as faToEn } from "@/lib/fa";
import { getUsers, saveUsers } from "@/lib/users-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

async function currentUser() {
  const session = await getSession();
  return session ? getSessionUser(session) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401, headers: noStore });
  return NextResponse.json({
    profile: {
      name: user.name,
      company: user.company,
      nationalId: user.nationalId ?? "",
      economicCode: user.economicCode ?? "",
      mobile: user.mobile,
      email: user.email,
      address: user.address ?? "",
    },
  }, { headers: noStore });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  const user = session ? await getSessionUser(session) : null;
  if (!session || !user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401, headers: noStore });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const company = String(body?.company ?? "").trim();
  const nationalId = faToEn(String(body?.nationalId ?? "").trim()).replace(/\D/g, "");
  const economicCode = faToEn(String(body?.economicCode ?? "").trim()).replace(/\D/g, "");
  const mobile = faToEn(String(body?.mobile ?? "").trim().replace(/[\s()-]/g, ""));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const address = String(body?.address ?? "").trim();

  if (name.length < 2) return NextResponse.json({ error: "نام و نام خانوادگی را کامل وارد کنید." }, { status: 400, headers: noStore });
  if (mobile && !MOBILE.test(mobile)) return NextResponse.json({ error: "شماره موبایل معتبر نیست؛ با 09 و ۱۱ رقم وارد کنید." }, { status: 400, headers: noStore });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "ایمیل معتبر نیست." }, { status: 400, headers: noStore });

  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index < 0) return NextResponse.json({ error: "حساب کاربری پیدا نشد." }, { status: 404, headers: noStore });

  // شمارهٔ موبایل و ایمیل باید در کل حساب‌ها یکتا بمانند.
  if (mobile && users.some((u) => u.id !== user.id && u.mobile && u.mobile === mobile)) {
    return NextResponse.json({ error: "این شماره موبایل برای حساب دیگری ثبت شده است." }, { status: 409, headers: noStore });
  }
  if (email && users.some((u) => u.id !== user.id && u.email && u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "این ایمیل برای حساب دیگری ثبت شده است." }, { status: 409, headers: noStore });
  }

  users[index] = { ...users[index], name, company, nationalId, economicCode, mobile, email, address };
  await saveUsers(users);

  // نام ممکن است تغییر کرده باشد؛ کوکی نشست را با اطلاعات تازه بازنویسی می‌کنیم.
  const jar = await cookies();
  jar.set(sessionCookie(sessionFor(users[index], true), true));

  return NextResponse.json({
    ok: true, message: "مشخصات ذخیره شد.",
    profile: { name, company, nationalId, economicCode, mobile, email, address },
  }, { headers: noStore });
}
