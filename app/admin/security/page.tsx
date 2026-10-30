import { redirect } from "next/navigation";
import { adminLoginPath, getSession } from "@/lib/auth";
import TotpSetup from "@/components/admin/TotpSetup";

export const metadata = { title: "امنیت حساب" };

// صفحهٔ امنیت حساب مدیر: فعال/غیرفعال‌کردن ورود دومرحله‌ای (Google Authenticator).
// این صفحه بیرون از گروه محافظت‌شدهٔ (panel) است تا حتی با نشست محدود «setup» هم باز شود.
export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const s = await getSession();
  if (!s) redirect(`${adminLoginPath()}?next=/admin/security`);
  if (s.role === "buyer") redirect("/dashboard");
  // کارشناس فروش به امنیت حساب دسترسی ندارد.
  if (s.role !== "manager") redirect("/admin");

  const sp = await searchParams;
  // اگر ورود دومرحله‌ای هنوز فعال نشده باشد، این صفحه اجباراً نمایش داده می‌شود.
  const forced = sp.setup === "1" || s.scope === "setup";

  return (
    <div dir="rtl" className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-xl font-bold md:text-2xl">امنیت حساب مدیر</h1>
      <p className="mt-1 text-sm text-ink/70">
        ورود دومرحله‌ای با برنامهٔ Google Authenticator از دسترسی با رمز عبور لو‌رفته جلوگیری می‌کند.
      </p>
      {forced && (
        <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium leading-7 text-amber-900">
          برای دسترسی به پنل مدیریت، ابتدا باید ورود دومرحله‌ای را فعال کنید.
        </p>
      )}
      <div className="mt-6">
        <TotpSetup forced={forced} />
      </div>
    </div>
  );
}
