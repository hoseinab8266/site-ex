import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession, getSessionUser } from "@/lib/auth";
import { getUsers, saveUsers } from "@/lib/users-store";
import { avatarOf, isElementAvatar } from "@/lib/avatars";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp",
};

async function currentUser() {
  const session = await getSession();
  return session ? getSessionUser(session) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401 });
  return NextResponse.json({ avatar: avatarOf(user) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "ابتدا وارد حساب شوید." }, { status: 401 });

  let avatar = "";
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    const file = (await req.formData().catch(() => null))?.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "فایل تصویر انتخاب نشده است." }, { status: 400 });
    const extension = extensions[file.type];
    if (!extension) return NextResponse.json({ error: "فرمت مجاز: JPG، PNG یا WEBP." }, { status: 400 });
    if (file.size < 1 || file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "حجم تصویر باید کمتر از ۲ مگابایت باشد." }, { status: 400 });
    const directory = path.join(process.cwd(), "public", "uploads", "members");
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    avatar = `/uploads/members/${filename}`;
  } else {
    const body = await req.json().catch(() => null);
    avatar = String(body?.avatar ?? "");
    if (!isElementAvatar(avatar)) return NextResponse.json({ error: "این تصویر پروفایل معتبر نیست." }, { status: 400 });
  }

  const users = await getUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index < 0) return NextResponse.json({ error: "حساب کاربری پیدا نشد." }, { status: 404 });
  users[index] = { ...users[index], avatar };
  await saveUsers(users);
  return NextResponse.json({ avatar });
}
