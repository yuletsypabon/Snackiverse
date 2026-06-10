import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { RechargeManager } from "@/modules/recharges/components/recharge-manager";
import { listStudents } from "@/modules/students/services/student.service";

export default async function RechargesPage() {
  const students = await listStudents();
  return (
    <AdminShell activeHref="/recharges">
      <RechargeManager students={students} />
    </AdminShell>
  );
}
