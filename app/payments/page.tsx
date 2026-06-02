import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { PaymentsManager } from "@/modules/payments/components/payments-manager";
import { listPayments } from "@/modules/payments/services/payment.service";
import { listStudents } from "@/modules/students/services/student.service";

export default async function PaymentsPage() {
  const [students, payments] = await Promise.all([
    listStudents(),
    listPayments(),
  ]);

  return (
    <AdminShell activeHref="/payments">
      <PaymentsManager students={students} initialPayments={payments} />
    </AdminShell>
  );
}
