import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { SaleRegister } from "@/modules/sales/components/sale-register";
import {
    listProducts,
    listCategories,
} from "@/modules/products/services/product.service";
import { listStudents } from "@/modules/students/services/student.service";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
    const [products, categories, students] = await Promise.all([
        listProducts(),
        listCategories(),
        listStudents(),
    ]);

    return (
        <AdminShell activeHref="/sales">
            <SaleRegister
                products={products}
                categories={categories}
                students={students}
            />
        </AdminShell>
    );
}
