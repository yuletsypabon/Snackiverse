import { AdminShell } from "@/modules/dashboard/components/admin-shell";
import { StudentManager } from "@/modules/students/components/student-manager";
import { listStudents } from "@/modules/students/services/student.service";
import { listTags } from "@/modules/tags/services/tag.service";
import { getSessionUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
    const [students, tags, session] = await Promise.all([
        listStudents(),
        listTags(),
        getSessionUser(),
    ]);

    return (
        <AdminShell activeHref="/students" role={session?.role}>
            <StudentManager initialStudents={students} initialTags={tags} />
        </AdminShell>
    );
}
