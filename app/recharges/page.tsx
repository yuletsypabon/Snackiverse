import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { RechargeManager } from "@/modules/recharges/components/recharge-manager";
import { listStudents } from "@/modules/students/services/student.service";
import { getSessionUser } from "@/lib/api-auth";

export default async function RechargesPage() {
  const [students, session] = await Promise.all([
    listStudents(),
    getSessionUser(),
  ]);
  return (
    <AdminShell activeHref="/recharges" role={session?.role} userName={session?.name}>
      <RechargeManager students={students} />
    </AdminShell>
  );
}
