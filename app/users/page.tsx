import { listVendors } from "@/modules/vendors/services/vendor.service";
import { VendorManager } from "@/modules/vendors/components/vendor-manager";
import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { getSessionUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
    const [vendors, session] = await Promise.all([
        listVendors(),
        getSessionUser(),
    ]);
    return (
        <AdminShell activeHref="/users" role={session?.role}>
            <VendorManager initialVendors={vendors} />
        </AdminShell>
    );
}
