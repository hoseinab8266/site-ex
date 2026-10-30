import "server-only";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { getCatalog } from "@/lib/catalog-store";
import { productDetails } from "@/lib/product-details";
import { orders as seedOrders, type Order, type OrderItem } from "@/lib/panel-data";
import { faDigits, nextDocId } from "@/lib/fa";

const file = path.join(process.cwd(), "data", "orders.json");

export async function getOrders(): Promise<Order[]> {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (Array.isArray(parsed)) return parsed as Order[];
  } catch {
    /* با مقدار اولیه ساخته می‌شود */
  }
  await saveOrders(seedOrders);
  return seedOrders;
}

export async function saveOrders(orders: Order[]) {
  await mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await writeFile(temp, JSON.stringify(orders, null, 2), "utf8");
  await rename(temp, file);
}

// مبلغ هر ردیف فقط در سرور از روی کاتالوگ محاسبه می‌شود تا از سمت کلاینت دست‌کاری نشود.
export async function priceLines(raw: { slug: string; qty: number }[]) {
  const catalog = await getCatalog();
  const lines: OrderItem[] = [];
  for (const { slug, qty } of raw) {
    const product = catalog.products.find((p) => p.slug === slug);
    if (!product || !Number.isFinite(qty) || qty < 1) continue;
    const pack = productDetails[slug]?.pack ?? { size: 1, label: product.unit };
    const amount = Math.floor(qty) * pack.size;
    lines.push({
      slug,
      name: product.name,
      qty: Math.floor(qty),
      packSize: pack.size,
      packLabel: pack.label,
      amount,
      unitPrice: product.price,
      total: amount * product.price,
    });
  }
  return lines;
}

export async function createOrder(input: {
  userId: string;
  customer: string;
  mobile?: string;
  note?: string;
  items: { slug: string; qty: number }[];
}) {
  const lines = await priceLines(input.items);
  if (lines.length === 0) return null;

  const all = await getOrders();
  const id = nextDocId("PR", all.map((o) => o.id));
  const now = new Date();
  const date = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long", year: "numeric" }).format(now);
  const item = lines.map((l) => l.name).join("، ");
  const qty = lines.map((l) => `${faDigits(l.amount)} بسته`).join("، ");
  const total = lines.reduce((s, l) => s + l.total, 0);

  const order: Order = {
    id,
    date,
    item,
    qty,
    total,
    status: "pending",
    customer: input.customer,
    userId: input.userId,
    mobile: input.mobile,
    note: input.note,
    amount: lines.reduce((s, l) => s + l.amount, 0),
    lines,
    updatedAt: now.toISOString(),
  };

  await saveOrders([order, ...all]);
  return order;
}

export async function setOrderStatus(id: string, status: Order["status"]) {
  const all = await getOrders();
  const order = all.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await saveOrders(all);
  return order;
}

// جست‌وجوی عمومی برای رهگیری؛ فقط شمارهٔ سفارش، بدون افشای سفارش‌های دیگران.
export async function findOrder(id: string) {
  const all = await getOrders();
  return all.find((o) => o.id === String(id).trim()) ?? null;
}
