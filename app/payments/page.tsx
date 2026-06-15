import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { PaymentsManager } from "@/modules/payments/components/payments-manager";
import { listPayments } from "@/modules/payments/services/payment.service";
import { listStudents } from "@/modules/students/services/student.service";
import { getSessionUser } from "@/lib/api-auth";

export default async function PaymentsPage() {
  const [students, payments, session] = await Promise.all([
    listStudents(),
    listPayments(),
    getSessionUser(),
  ]);

  return (
    <AdminShell activeHref="/payments" role={session?.role}>
      <PaymentsManager students={students} initialPayments={payments} />
    </AdminShell>
  );
}
