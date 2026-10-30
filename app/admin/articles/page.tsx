import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog-store";
import CatalogManager from "@/components/admin/CatalogManager";
export const metadata = { title: "مدیریت مقالات" };
export const dynamic = "force-dynamic";
export default async function AdminArticles() {
  const session = await getSession();
  if (session?.role !== "manager") redirect("/admin");
  const catalog = await getCatalog();
  return <CatalogManager collection="articles" initialItems={catalog.articles} />;
}
