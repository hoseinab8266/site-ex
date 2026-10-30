import type { ReactNode } from "react";
import { statusLabel, type Status } from "@/lib/panel-data";

export function PageTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
        {hint && <p className="mt-1 text-sm text-ink/70">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-[0_8px_24px_-18px_rgba(6,48,58,.5)]">
      <p className="text-sm text-ink/70">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {note && <p className="mt-1 text-xs text-ink/60">{note}</p>}
    </div>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const s = statusLabel[status];
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export function Pill({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "amber" | "rose" }) {
  const c = { gray: "bg-paper text-ink/80", green: "bg-emerald-100 text-emerald-900", amber: "bg-amber-100 text-amber-900", rose: "bg-rose-100 text-rose-900" }[tone];
  return <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${c}`}>{children}</span>;
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-paper text-ink/75">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-start font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-paper/60">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3.5">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <div className="mt-1.5 font-normal">{children}</div>
    </label>
  );
}

export const inputCls = "h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-brand";
