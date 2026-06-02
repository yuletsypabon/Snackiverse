import { listVendors } from "@/modules/vendors/services/vendor.service";
import { VendorManager } from "@/modules/vendors/components/vendor-manager";
import { AdminShell } from "@/modules/dashboard/components/admin-shell";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const vendors = await listVendors();
    return  (
        <AdminShell activeHref="/users">
            <VendorManager initialVendors={vendors} />;
        </AdminShell>
    );
}