import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession, getSessionUser, sessionCookie, sessionFor, strongPass } from "@/lib/auth";
import { getUsers, saveUsers, makePasswordHash, verifyPassword } from "@/lib/users-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const session = await getSession();
  const user = session ? await getSessionUser(session) : null;
  if (!session || !user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401, headers: noStore });

  const body = await req.json().catch(() => null);
  const current = String(body?.current ?? "");
  const password = String(body?.password ?? "");
  const confirm = String(body?.confirm ?? "");

  if (!current || !password || !confirm) {
    return NextResponse.json({ error: "رمز فعلی، رمز جدید و تکرار آن را وارد کنید." }, { status: 400, headers: noStore });
  }
  if (!verifyPassword(current, user.passwordHash)) {
    return NextResponse.json({ error: "رمز فعلی درست نیست." }, { status: 400, headers: noStore });
  }
  if (password !== confirm) {
    return NextResponse.json({ error: "رمز جدید و تکرار آن یکسان نیستند." }, { status: 400, headers: noStore });
  }
  if (!strongPass(password)) {
    return NextResponse.json({ error: "رمز جدید باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد." }, { status: 400, headers: noStore });
  }
  if (verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "رمز جدید باید با رمز فعلی متفاوت باشد." }, { status: 400, headers: noStore });
  }

  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index < 0) return NextResponse.json({ error: "حساب کاربری پیدا نشد." }, { status: 404, headers: noStore });

  users[index] = { ...users[index], passwordHash: makePasswordHash(password) };
  await saveUsers(users);

  // پس از تغییر رمز، شناسهٔ نشست (sid) عوض می‌شود و همهٔ نشست‌های قدیمی باطل می‌شوند.
  const jar = await cookies();
  jar.set(sessionCookie(sessionFor(users[index], true), true));

  return NextResponse.json({ ok: true, message: "رمز عبور تغییر کرد." }, { headers: noStore });
}
