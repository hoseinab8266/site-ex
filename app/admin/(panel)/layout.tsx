import { redirect } from "next/navigation";
import PanelShell from "@/components/panel/PanelShell";
import { adminNav } from "@/lib/panel-data";
import { adminLoginPath, getSession, getSessionUser } from "@/lib/auth";
import { avatarOf } from "@/lib/avatars";

export const metadata = { title: "پنل مدیریت" };

// نقش‌های `manager` و `member` (کارشناس فروش) هر دو به پنل مدیریت دسترسی دارند؛
// مشتریان به داشبورد خودشان هدایت می‌شوند و کاربران واردنشده به صفحهٔ ورود کارکنان.
export default async function Layout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect(`${adminLoginPath()}?next=/admin`);
  if (s.role === "buyer") redirect("/dashboard");

  // مدیرِ بدون ورود دومرحله‌ای، پیش از هر کاری باید «امنیت حساب» را فعال کند.
  if (s.role === "manager" && s.scope === "setup") redirect("/admin/security?setup=1");

  const user = await getSessionUser(s);
  // کارشناس فروش به بخش امنیت حساب دسترسی ندارد.
  const nav = s.role === "manager" ? adminNav : adminNav.filter((item) => item.href !== "/admin/security");
  return <PanelShell role="admin" userName={s.name} avatar={avatarOf(user ?? { name: s.name })} nav={nav}>{children}</PanelShell>;
}
