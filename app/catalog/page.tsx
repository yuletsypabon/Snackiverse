import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { CatalogManager } from "@/modules/catalog/components/catalog-manager";
import { listCategoriesWithCount } from "@/modules/products/services/category.service";
import { listTags } from "@/modules/tags/services/tag.service";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [categories, tags] = await Promise.all([
    listCategoriesWithCount(),
    listTags(),
  ]);

  return (
    <AdminShell activeHref="/catalog">
      <CatalogManager initialCategories={categories} initialTags={tags} />
    </AdminShell>
  );
}
