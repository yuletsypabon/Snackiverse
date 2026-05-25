import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
    CreateStudentInput,
    StudentDto,
    UpdateStudentInput,
} from "../schemas/student.schema";

const studentSelect = {
    id: true,
    name: true,
    grade: true,
    type: true,
    balance: true,
    isActive: true,
    foodRestriction: true,
    guardianWhatsapp: true,
    createdAt: true,
    _count: {
        select: {
            sales: true,
            recharges: true,
            payments: true,
        },
    },
} satisfies Prisma.StudentSelect;

type StudentWithCounts = Prisma.StudentGetPayload<{
    select: typeof studentSelect;
}>;

function normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
}

function toStudentDto(student: StudentWithCounts): StudentDto {
    return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        type: student.type,
        balance: student.balance,
        isActive: student.isActive,
        foodRestriction: student.foodRestriction,
        guardianWhatsapp: student.guardianWhatsapp,
        createdAt: student.createdAt.toISOString(),
        salesCount: student._count.sales,
        rechargesCount: student._count.recharges,
        paymentsCount: student._count.payments,
    };
}

export async function listStudents() {
    const students = await prisma.student.findMany({
        select: studentSelect,
        orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return students.map(toStudentDto);
}

export async function createStudent(input: CreateStudentInput) {
    const student = await prisma.student.create({
        data: {
            name: input.name,
            grade: input.grade,
            type: input.type,
            balance: input.balance,
            foodRestriction: normalizeOptionalText(input.foodRestriction),
            guardianWhatsapp: normalizeOptionalText(input.guardianWhatsapp),
        },
        select: studentSelect,
    });

    return toStudentDto(student);
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
    const student = await prisma.student.update({
        where: { id },
        data: {
            ...input,
            foodRestriction:
                input.foodRestriction !== undefined
                    ? normalizeOptionalText(input.foodRestriction)
                    : undefined,
            guardianWhatsapp:
                input.guardianWhatsapp !== undefined
                    ? normalizeOptionalText(input.guardianWhatsapp)
                    : undefined,
        },
        select: studentSelect,
    });

    return toStudentDto(student);
}

export async function deactivateStudent(id: string) {
    return updateStudent(id, { isActive: false });
}
