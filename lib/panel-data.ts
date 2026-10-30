// ⚠️ همه داده‌های پنل «نمونه» است و در مرحله دیتابیس جایگزین می‌شود.

export type Status = "pending" | "processing" | "shipped" | "done" | "cancelled";

export const statusLabel: Record<Status, { label: string; cls: string }> = {
  pending: { label: "در انتظار تأیید", cls: "bg-amber-100 text-amber-900" },
  processing: { label: "در حال آماده‌سازی", cls: "bg-sky-100 text-sky-900" },
  shipped: { label: "ارسال شده", cls: "bg-violet-100 text-violet-900" },
  done: { label: "تحویل شده", cls: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "لغو شده", cls: "bg-rose-100 text-rose-900" },
};

// یک ردیف سفارش؛ مبالغ در سرور از روی کاتالوگ محاسبه می‌شود تا دست‌کاری نشود.
export type OrderItem = {
  slug: string;
  name: string;
  qty: number;
  packSize: number;
  packLabel: string;
  amount: number;
  unitPrice: number;
  total: number;
};

export type Order = {
  id: string;
  date: string;
  item: string;
  qty: string;
  total: number;
  status: Status;
  customer: string;
  userId?: string;
  mobile?: string;
  note?: string;
  amount?: number;
  lines?: OrderItem[];
  updatedAt?: string;
};

// ⚠️ سفارش‌های نمونه؛ userId نمونه به خریدار پیش‌فرض وصل است تا داشبورد پر به نظر برسد.
export const orders: Order[] = [
  { id: "PR-۱۰۴۸", date: "۲۸ مهر ۱۴۰۵", item: "پلی‌اتیلن سنگین، گرید لوله", qty: "۲ تن", total: 196000000, status: "processing", customer: "شرکت نمونه صنعت", userId: "seed-buyer" },
  { id: "PR-۱۰۴۱", date: "۲۱ مهر ۱۴۰۵", item: "رزین اپوکسی مایع", qty: "۲۰۰ کیلوگرم", total: 49000000, status: "shipped", customer: "کارگاه رزین‌کار", userId: "seed-buyer" },
  { id: "PR-۱۰۳۵", date: "۱۴ مهر ۱۴۰۵", item: "پلی‌پروپیلن هموپلیمر", qty: "۱ تن", total: 87000000, status: "done", customer: "شرکت نمونه صنعت", userId: "seed-buyer" },
  { id: "PR-۱۰۳۰", date: "۹ مهر ۱۴۰۵", item: "رزین پی‌وی‌سی K67", qty: "۳ تن", total: 156000000, status: "pending", customer: "پروفیل البرز", userId: "seed-buyer" },
  { id: "PR-۱۰۲۲", date: "۲ مهر ۱۴۰۵", item: "پلی‌پروپیلن هموپلیمر", qty: "۵۰۰ کیلوگرم", total: 43500000, status: "cancelled", customer: "کارگاه رزین‌کار", userId: "seed-buyer" },
];

// وضعیت پیش‌فاکتور با کلید انگلیسی ذخیره می‌شود و برچسب فارسی نمایش داده می‌شود.
export type ProformaState = "pending" | "issued" | "expired" | "rejected";

export const proformaStateLabel: Record<ProformaState, { label: string; tone: "gray" | "green" | "amber" | "rose" }> = {
  pending: { label: "منتظر پاسخ", tone: "amber" },
  issued: { label: "صادر شد", tone: "green" },
  expired: { label: "منقضی", tone: "gray" },
  rejected: { label: "رد شد", tone: "rose" },
};

export type Proforma = {
  id: string;
  date: string;
  item: string;
  qty: string;
  state: ProformaState;
  userId?: string;
  slug?: string;
  qtyNum?: number;
  note?: string;
  customer?: string;
  updatedAt?: string;
};

// ⚠️ پیش‌فاکتورهای نمونه.
export const proformas: Proforma[] = [
  { id: "PF-۲۰۹", date: "۲۹ مهر ۱۴۰۵", item: "پلی‌اتیلن سنگین، گرید لوله", qty: "۵ تن", state: "pending", userId: "seed-buyer", note: "تحویل درب کارخانه" },
  { id: "PF-۲۰۴", date: "۲۳ مهر ۱۴۰۵", item: "رزین اپوکسی مایع", qty: "۲۰۰ کیلوگرم", state: "issued", userId: "seed-buyer" },
  { id: "PF-۱۹۸", date: "۱۵ مهر ۱۴۰۵", item: "رزین پی‌وی‌سی K67", qty: "۳ تن", state: "expired", userId: "seed-buyer" },
];

export const members = [
  { name: "مدیر سایت", role: "مدیر کل", email: "admin@polyrez.ir", active: true },
  { name: "کارشناس فروش ۱", role: "کارشناس فروش", email: "sales1@polyrez.ir", active: true },
  { name: "کارشناس فنی", role: "مشاور فنی", email: "tech@polyrez.ir", active: true },
  { name: "مسئول انبار", role: "انباردار", email: "stock@polyrez.ir", active: false },
];

export const buyerNav = [
  { href: "/dashboard", label: "نمای کلی" },
  { href: "/dashboard/orders", label: "سفارش‌های من" },
  { href: "/dashboard/proforma", label: "پیش‌فاکتورها" },
  { href: "/dashboard/profile", label: "مشخصات من" },
];

export const adminNav = [
  { href: "/admin", label: "داشبورد مدیریت" },
  { href: "/admin/orders", label: "سفارش‌ها" },
  { href: "/admin/proforma", label: "پیش‌فاکتورها" },
  { href: "/admin/messages", label: "پیام‌ها" },
  { href: "/admin/products", label: "محصولات" },
  { href: "/admin/articles", label: "مقالات" },
  { href: "/admin/members", label: "اعضای شرکت" },
  { href: "/admin/security", label: "امنیت حساب" },
];
