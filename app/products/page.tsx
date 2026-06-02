import { ProductTable } from "@/modules/products/components/productTable";
import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import {
  listCategories,
  listProducts,
} from "@/modules/products/services/product.service";
import { listTags } from "@/modules/tags/services/tag.service";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories, tags] = await Promise.all([
    listProducts(),
    listCategories(),
    listTags(),
  ]);

  return (
    <AdminShell activeHref="/products">
      <ProductTable initialProducts={products} categories={categories} tags={tags} />
    </AdminShell>
  );
}
