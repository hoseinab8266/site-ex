import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const extensions: Record<string, string> = {
  "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "image/avif": ".avif",
};

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "manager") return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  try {
    const form = await req.formData();
    const folder = form.get("folder") === "members" ? "members" : "products";
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "فایل تصویر انتخاب نشده است." }, { status: 400 });
    const extension = extensions[file.type];
    if (!extension) return NextResponse.json({ error: "فرمت مجاز: JPG، PNG، WEBP، GIF یا AVIF." }, { status: 400 });
    if (file.size < 1 || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const directory = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}${extension}`;
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    return NextResponse.json({ ok: true, url: `/uploads/${folder}/${filename}` });
  } catch {
    return NextResponse.json({ error: "ذخیره تصویر روی سرور انجام نشد." }, { status: 500 });
  }
}
