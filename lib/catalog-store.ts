import "server-only";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { articles as seedArticles, products as seedProducts, type Article, type Product } from "@/lib/data";

export type Catalog = { products: Product[]; articles: (Article & { body?: string; published?: boolean })[] };
const file = path.join(process.cwd(), "data", "catalog.json");

export async function getCatalog(): Promise<Catalog> {
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Catalog>;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : seedProducts,
      articles: Array.isArray(parsed.articles) ? parsed.articles : seedArticles,
    };
  } catch {
    return { products: seedProducts, articles: seedArticles };
  }
}

export async function saveCatalog(catalog: Catalog) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(catalog, null, 2), "utf8");
  const { rename } = await import("node:fs/promises");
  await rename(temp, file);
}
