import "server-only";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { proformas as seedProformas, type Proforma, type ProformaState } from "@/lib/panel-data";
import { getCatalog } from "@/lib/catalog-store";
import { productDetails } from "@/lib/product-details";
import { faDigits, nextDocId } from "@/lib/fa";

const file = path.join(process.cwd(), "data", "proformas.json");

export async function getProformas(): Promise<Proforma[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) return parsed as Proforma[];
  } catch {
    /* با مقدار اولیه ساخته می‌شود */
  }
  await saveProformas(seedProformas);
  return seedProformas;
}

export async function saveProformas(items: Proforma[]) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(items, null, 2), "utf8");
  await rename(temp, file);
}

export async function createProforma(input: {
  userId: string;
  customer: string;
  slug: string;
  qty: number;
  note?: string;
}) {
  const catalog = await getCatalog();
  const product = catalog.products.find((p) => p.slug === input.slug);
  if (!product || !Number.isFinite(input.qty) || input.qty < 1) return null;

  const pack = productDetails[input.slug]?.pack ?? { size: 1, label: product.unit };
  const amount = Math.floor(input.qty) * pack.size;

  const all = await getProformas();
  const id = nextDocId("PF", all.map((p) => p.id));
  const date = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

  const proforma: Proforma = {
    id,
    date,
    item: product.name,
    qty: `${faDigits(amount)} ${product.unit}`,
    state: "pending",
    userId: input.userId,
    slug: input.slug,
    qtyNum: Math.floor(input.qty),
    note: input.note,
    customer: input.customer,
    updatedAt: new Date().toISOString(),
  };

  await saveProformas([proforma, ...all]);
  return proforma;
}

export async function setProformaState(id: string, state: ProformaState) {
  const all = await getProformas();
  const item = all.find((p) => p.id === id);
  if (!item) return null;
  item.state = state;
  item.updatedAt = new Date().toISOString();
  await saveProformas(all);
  return item;
}
