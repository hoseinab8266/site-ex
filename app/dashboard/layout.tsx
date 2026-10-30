import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { buyerNav } from "@/lib/panel-data";
import { getSession, getSessionUser } from "@/lib/auth";
import { avatarOf } from "@/lib/avatars";

export const metadata = { title: "پنل خریدار" };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard");
  if (s.role !== "buyer") redirect("/admin");
  const user = await getSessionUser(s);
  return <PanelShell role="buyer" userName={s.name} avatar={avatarOf(user ?? { name: s.name })} nav={buyerNav}>{children}</PanelShell>;
}
