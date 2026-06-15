import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { ReportsManager } from "@/modules/reports/components/reports-manager";
import { listStudents } from "@/modules/students/services/student.service";
import { getSessionUser } from "@/lib/api-auth";

export default async function ReportsPage() {
  const [students, session] = await Promise.all([
    listStudents(),
    getSessionUser(),
  ]);

  return (
    <AdminShell activeHref="/reports" role={session?.role}>
      <ReportsManager students={students} />
    </AdminShell>
  );
}
