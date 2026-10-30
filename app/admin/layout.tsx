import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { adminNav } from "@/lib/panel-data";
import { getSession, getSessionUser } from "@/lib/auth";
import { avatarOf } from "@/lib/avatars";

export const metadata = { title: "پنل مدیریت" };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login?next=/admin");
  if (s.role !== "manager") redirect("/dashboard");
  const user = await getSessionUser(s);
  return <PanelShell role="admin" userName={s.name} avatar={avatarOf(user ?? { name: s.name })} nav={adminNav}>{children}</PanelShell>;
}
