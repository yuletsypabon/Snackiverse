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
    guardianWhatsapp: true,
    tiqueteraExpiresAt: true,
    createdAt: true,
    _count: {
        select: {
            sales: true,
            recharges: true,
            payments: true,
        },
    },
    restrictions: {
        select: {
            tag: { select: { id: true, name: true } },
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

function calculateExpiresAt(type: string, from: Date): Date | null {
    if (type === "weekly")   return new Date(from.getTime() + 7  * 86400000);
    if (type === "biweekly") return new Date(from.getTime() + 15 * 86400000);
    if (type === "monthly")  return new Date(from.getTime() + 30 * 86400000);
    return null;
}

function toStudentDto(student: StudentWithCounts): StudentDto {
    return {
        id: student.id,
        name: student.name,
        grade: student.grade,
        type: student.type,
        balance: student.balance,
        isActive: student.isActive,
        guardianWhatsapp: student.guardianWhatsapp,
        tiqueteraExpiresAt: student.tiqueteraExpiresAt?.toISOString() ?? null,
        createdAt: student.createdAt.toISOString(),
        salesCount: student._count.sales,
        rechargesCount: student._count.recharges,
        paymentsCount: student._count.payments,
        restrictions: student.restrictions.map((r) => ({
            id: r.tag.id,
            name: r.tag.name,
        })),
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
    const validTagIds = (input.restrictionTagIds ?? []).filter(Boolean);

    const student = await prisma.student.create({
        data: {
            name: input.name,
            grade: input.grade,
            type: input.type,
            balance: input.balance,
            guardianWhatsapp: normalizeOptionalText(input.guardianWhatsapp),
            tiqueteraExpiresAt: calculateExpiresAt(input.type, new Date()),
            restrictions: validTagIds.length > 0
                ? { create: validTagIds.map((tagId) => ({ tagId })) }
                : undefined,
        },
        select: studentSelect,
    });

    return toStudentDto(student);
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
    const student = await prisma.student.update({
        where: { id },
        data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.grade !== undefined && { grade: input.grade }),
            ...(input.type !== undefined && { type: input.type }),
            ...(input.type !== undefined && {
                tiqueteraExpiresAt: calculateExpiresAt(input.type, new Date()),
            }),
            ...(input.balance !== undefined && { balance: input.balance }),
            ...(input.isActive !== undefined && { isActive: input.isActive }),
            ...(input.guardianWhatsapp !== undefined && {
                guardianWhatsapp: normalizeOptionalText(input.guardianWhatsapp),
            }),
            ...(input.restrictionTagIds !== undefined && {
                restrictions: {
                    deleteMany: {},
                    create: input.restrictionTagIds
                        .filter(Boolean)
                        .map((tagId) => ({ tagId })),
                },
            }),
        },
        select: studentSelect,
    });

    return toStudentDto(student);
}

export async function deleteStudent(id: string) {
    const student = await prisma.student.findUnique({
        where: { id },
        select: {
            _count: {
                select: {
                    sales: true,
                    recharges: true,
                    payments: true,
                },
            },
        },
    });

    if (!student) {
        throw new Error("Estudiante no encontrado");
    }

    const hasHistory =
        student._count.sales > 0 ||
        student._count.recharges > 0 ||
        student._count.payments > 0;

    if (hasHistory) {
        throw new Error(
            "No se puede eliminar un estudiante con ventas, recargas o pagos asociados."
        );
    }

    await prisma.student.delete({
        where: { id },
    });
}
