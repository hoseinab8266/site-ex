import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "webp", "png"];

// اگر عکسی با نام slug داخل public/<dir> باشد، مسیرش را برمی‌گرداند؛ وگرنه null.
// مثال: localImage("categories", "epoxy") ← public/categories/epoxy.jpg
export function localImage(dir: string, slug: string): string | null {
  for (const ext of EXTENSIONS) {
    const file = path.join(process.cwd(), "public", dir, `${slug}.${ext}`);
    if (fs.existsSync(file)) return `/${dir}/${slug}.${ext}`;
  }
  return null;
}
