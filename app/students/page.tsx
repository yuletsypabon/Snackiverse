import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { StudentManager } from "@/modules/students/components/student-manager";
import { listStudents } from "@/modules/students/services/student.service";
import { listTags } from "@/modules/tags/services/tag.service";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
    const [students, tags] = await Promise.all([listStudents(), listTags()]);

    return (
        <AdminShell activeHref="/students">
            <StudentManager initialStudents={students} initialTags={tags} />
        </AdminShell>
    );
}
