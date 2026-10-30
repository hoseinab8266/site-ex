import Link from "next/link";
import { PageTitle, StatCard, StatusBadge, Table } from "@/components/panel/ui";
import { getOrders } from "@/lib/orders-store";
import { getProformas } from "@/lib/proformas-store";
import { getMessages } from "@/lib/messages-store";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [orders, proformas, messages] = await Promise.all([getOrders(), getProformas(), getMessages()]);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const processingCount = orders.filter((o) => o.status === "processing").length;
  const totalSales = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const openProformas = proformas.filter((p) => p.state === "requested" || p.state === "issued").length;
  const unreadMessages = messages.filter((m) => !m.read).length;

  const formattedSales = (totalSales / 1000000).toLocaleString("fa-IR") + " میلیون";

  return (
    <>
      <PageTitle title="داشبورد مدیریت" hint="نمای کلی فروش، سفارش‌ها و درخواست‌ها" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="سفارش‌های جدید" value={pendingCount.toLocaleString("fa-IR")} note="در انتظار تأیید" />
        <StatCard label="در حال آماده‌سازی" value={processingCount.toLocaleString("fa-IR")} note="سفارش فعال" />
        <StatCard label="مجموع فروش" value={formattedSales} note="تومان" />
        <StatCard label="کل سفارشات" value={orders.length.toLocaleString("fa-IR")} note="ثبت شده" />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/proforma" className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 transition hover:border-brand">
          <span className="text-sm font-bold text-ink">پیش‌فاکتورهای باز</span>
          <span className="text-lg font-bold text-brand">{openProformas.toLocaleString("fa-IR")}</span>
        </Link>
        <Link href="/admin/messages" className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-4 transition hover:border-brand">
          <span className="text-sm font-bold text-ink">پیام‌های خوانده‌نشده</span>
          <span className="text-lg font-bold text-brand">{unreadMessages.toLocaleString("fa-IR")}</span>
        </Link>
      </div>

      <h2 className="mb-4 text-lg font-bold">آخرین سفارش‌ها</h2>
      {orders.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">هنوز سفارشی ثبت نشده است.</p>
      ) : (
        <Table
          head={["شماره", "مشتری", "محصول", "وضعیت"]}
          rows={orders.slice(0, 5).map((o) => [
            <bdi key="i" className="font-medium">{o.id}</bdi>,
            o.customer,
            o.item,
            <StatusBadge key="s" status={o.status} />,
          ])}
        />
      )}
    </>
  );
}
