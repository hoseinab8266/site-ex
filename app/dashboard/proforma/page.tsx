import { redirect } from "next/navigation";
import { PageTitle, Pill, Table } from "@/components/panel/ui";
import ProformaForm from "@/components/ProformaForm";
import { getSession } from "@/lib/auth";
import { getProformas } from "@/lib/proformas-store";
import { proformaStateLabel } from "@/lib/panel-data";

export const dynamic = "force-dynamic";

export default async function Proformas() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/proforma");

  const all = await getProformas();
  const mine = session.role === "buyer" ? all.filter((p) => p.userId === session.uid) : all;

  return (
    <>
      <PageTitle title="پیش‌فاکتورها" hint="درخواست‌های شما و پیش‌فاکتورهای صادرشده" />

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-ink">درخواست پیش‌فاکتور جدید</h2>
        <ProformaForm />
      </div>

      {mine.length === 0 ? (
        <p className="rounded-xl border border-line bg-white px-4 py-6 text-sm text-ink/70">هنوز پیش‌فاکتوری ثبت نشده است.</p>
      ) : (
        <Table
          head={["شماره", "تاریخ", "محصول", "مقدار", "وضعیت"]}
          rows={mine.map((p) => [
            <bdi key="i" className="font-medium">{p.id}</bdi>,
            p.date,
            p.item,
            p.qty,
            <Pill key="s" tone={proformaStateLabel[p.state].tone}>{proformaStateLabel[p.state].label}</Pill>,
          ])}
        />
      )}
    </>
  );
}
