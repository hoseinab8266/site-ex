import { redirect } from "next/navigation";
import { PageTitle } from "@/components/panel/ui";
import ProfileForm from "@/components/ProfileForm";
import AvatarPicker from "@/components/AvatarPicker";
import { getSession, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const session = await getSession();
  const user = session ? await getSessionUser(session) : null;
  if (!user) redirect("/login?next=/dashboard/profile");

  return (
    <>
      <PageTitle title="مشخصات من" hint="اطلاعات حساب کاربری جهت ثبت و ارسال سفارش‌ها" />
      <AvatarPicker />
      <ProfileForm
        profile={{
          name: user.name,
          company: user.company,
          nationalId: user.nationalId ?? "",
          economicCode: user.economicCode ?? "",
          mobile: user.mobile,
          email: user.email,
          address: user.address ?? "",
        }}
      />
    </>
  );
}
