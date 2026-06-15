import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { CatalogManager } from "@/modules/catalog/components/catalog-manager";
import { listCategoriesWithCount } from "@/modules/products/services/category.service";
import { listTags } from "@/modules/tags/services/tag.service";
import { getSessionUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [categories, tags, session] = await Promise.all([
    listCategoriesWithCount(),
    listTags(),
    getSessionUser(),
  ]);

  return (
    <AdminShell activeHref="/catalog" role={session?.role}>
      <CatalogManager initialCategories={categories} initialTags={tags} />
    </AdminShell>
  );
}
