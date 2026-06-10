import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { ReportsManager } from "@/modules/reports/components/reports-manager";
import { listStudents } from "@/modules/students/services/student.service";

export default async function ReportsCenterPage() {
  const students = await listStudents();

  return (
    <AdminShell activeHref="/reports-center">
      <ReportsManager students={students} />
    </AdminShell>
  );
}
