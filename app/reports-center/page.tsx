import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { ReportsCenterManager } from "@/modules/reports-center/components/reports-center-manager";

export default function ReportsCenterPage() {
  return (
    <AdminShell activeHref="/reports-center">
      <ReportsCenterManager />
    </AdminShell>
  );
}
