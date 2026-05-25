import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { StudentManager } from "@/modules/students/components/student-manager";
import { listStudents } from "@/modules/students/services/student.service";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
    const students = await listStudents();

    return (
        <AdminShell activeHref="/students">
            <StudentManager initialStudents={students} />
        </AdminShell>
    );
}
