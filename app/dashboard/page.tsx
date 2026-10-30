import Link from "next/link";
import { redirect } from "next/navigation";
import { PageTitle, StatCard, StatusBadge, Table } from "@/components/panel/ui";
import { getSession, getSessionUser } from "@/lib/auth";
import { getOrders } from "@/lib/orders-store";

export const dynamic = "force-dynamic";

export default async function BuyerHome() {
  const session = await getSession();
  const user = session ? await getSessionUser(session) : null;
  if (!session || !user) redirect("/login?next=/dashboard");

  const orders = await getOrders();
  const mine = orders.filter((o) => o.userId === session.uid);

  const activeOrders = mine.filter((o) => o.status === "processing" || o.status === "shipped" || o.status === "pending");
  const completedOrders = mine.filter((o) => o.status === "done");

  return (
    <>
      <PageTitle
        title={`سلام، ${session.name || user.name}`}
        hint="خلاصه فعالیت‌های شما در پلیرز"
        action={
          <Link href="/products" className="btn-action rounded-xl px-5 py-2.5 text-sm font-bold">
            ثبت سفارش جدید
          </Link>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="سفارش‌های فعال" value={activeOrders.length.toLocaleString("fa-IR")} note="در حال پردازش یا ارسال" />
        <StatCard label="تحویل شده" value={completedOrders.length.toLocaleString("fa-IR")} note="سفارش‌های موفق" />
        <StatCard label="کل سفارش‌ها" value={mine.length.toLocaleString("fa-IR")} note="ثبت‌شده در سامانه" />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">آخرین سفارش‌ها</h2>
        <Link href="/dashboard/orders" className="text-xs font-bold text-brand hover:underline">
          مشاهده همه
        </Link>
      </div>

      {mine.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm leading-8 text-ink/70">
          هنوز سفارشی ثبت نکرده‌اید. از بخش محصولات، سفارش خود را ثبت کنید.
        </p>
      ) : (
        <Table
          head={["شماره", "تاریخ", "محصول", "مقدار", "مبلغ (تومان)", "وضعیت"]}
          rows={mine.slice(0, 5).map((o) => [
            <bdi key="i" className="font-medium">{o.id}</bdi>,
            o.date,
            o.item,
            o.qty,
            o.total.toLocaleString("fa-IR"),
            <StatusBadge key="s" status={o.status} />,
          ])}
        />
      )}
    </>
  );
}
