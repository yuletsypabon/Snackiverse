import { describe, it, expect, vi, beforeEach } from "vitest";
import { createStudent, deleteStudent, updateStudent } from "../student.service";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        student: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";

function makeStudentRow(overrides: Record<string, unknown> = {}) {
    return {
        id: "stu-1",
        name: "Juan Pérez",
        grade: "5°",
        type: "prepaid",
        balance: 5000,
        isActive: true,
        restrictions: [],
        guardianWhatsapp: null,
        createdAt: new Date("2026-01-01"),
        _count: { sales: 0, recharges: 0, payments: 0 },
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createStudent ────────────────────────────────────────────────────────────

describe("createStudent", () => {
    it("crea el estudiante y retorna el DTO correcto", async () => {
        const row = makeStudentRow();
        vi.mocked(prisma.student.create).mockResolvedValue(row as never);

        const result = await createStudent({
            name: "Juan Pérez",
            grade: "5°",
            type: "prepaid",
            balance: 5000,
            restrictionTagIds: [],
        });

        expect(prisma.student.create).toHaveBeenCalledOnce();
        expect(result.name).toBe("Juan Pérez");
        expect(result.balance).toBe(5000);
        expect(result.salesCount).toBe(0);
        expect(result.rechargesCount).toBe(0);
    });

    it("normaliza guardianWhatsapp vacío a null", async () => {
        const row = makeStudentRow({ restrictions: [], guardianWhatsapp: null });
        vi.mocked(prisma.student.create).mockResolvedValue(row as never);

        await createStudent({
            name: "Juan Pérez",
            grade: "5°",
            type: "prepaid",
            balance: 0,
            restrictionTagIds: [],
            guardianWhatsapp: "",
        });

        const callArg = vi.mocked(prisma.student.create).mock.calls[0][0];
        expect(callArg.data.guardianWhatsapp).toBeNull();
    });
});

// ─── updateStudent ────────────────────────────────────────────────────────────

describe("updateStudent", () => {
    it("actualiza y retorna el DTO con los cambios", async () => {
        const row = makeStudentRow({ name: "Juan Actualizado", isActive: false });
        vi.mocked(prisma.student.update).mockResolvedValue(row as never);

        const result = await updateStudent("stu-1", {
            name: "Juan Actualizado",
            isActive: false,
        });

        expect(result.name).toBe("Juan Actualizado");
        expect(result.isActive).toBe(false);
    });

    it("reemplaza restricciones cuando se envían restrictionTagIds", async () => {
        const row = makeStudentRow({ restrictions: [] });
        vi.mocked(prisma.student.update).mockResolvedValue(row as never);

        await updateStudent("stu-1", { restrictionTagIds: ["tag-1"] });

        const callArg = vi.mocked(prisma.student.update).mock.calls[0][0];
        expect(callArg.data.restrictions).toBeDefined();
    });

    it("no sobreescribe restrictions si no se incluye restrictionTagIds en el input", async () => {
        const row = makeStudentRow();
        vi.mocked(prisma.student.update).mockResolvedValue(row as never);

        await updateStudent("stu-1", { name: "Nuevo nombre" });

        const callArg = vi.mocked(prisma.student.update).mock.calls[0][0];
        expect(callArg.data.restrictions).toBeUndefined();
    });
});

// ─── deleteStudent ────────────────────────────────────────────────────────────

describe("deleteStudent", () => {
    it("elimina el estudiante si no tiene historial", async () => {
        vi.mocked(prisma.student.findUnique).mockResolvedValue(
            { _count: { sales: 0, recharges: 0, payments: 0 } } as never
        );
        vi.mocked(prisma.student.delete).mockResolvedValue({} as never);

        await deleteStudent("stu-1");

        expect(prisma.student.delete).toHaveBeenCalledWith({
            where: { id: "stu-1" },
        });
    });

    it("lanza error si el estudiante tiene ventas", async () => {
        vi.mocked(prisma.student.findUnique).mockResolvedValue(
            { _count: { sales: 2, recharges: 0, payments: 0 } } as never
        );

        await expect(deleteStudent("stu-1")).rejects.toThrow(
            "No se puede eliminar un estudiante con ventas"
        );
        expect(prisma.student.delete).not.toHaveBeenCalled();
    });

    it("lanza error si el estudiante tiene recargas", async () => {
        vi.mocked(prisma.student.findUnique).mockResolvedValue(
            { _count: { sales: 0, recharges: 5, payments: 0 } } as never
        );

        await expect(deleteStudent("stu-1")).rejects.toThrow(
            "No se puede eliminar"
        );
        expect(prisma.student.delete).not.toHaveBeenCalled();
    });

    it("lanza error si el estudiante tiene pagos", async () => {
        vi.mocked(prisma.student.findUnique).mockResolvedValue(
            { _count: { sales: 0, recharges: 0, payments: 1 } } as never
        );

        await expect(deleteStudent("stu-1")).rejects.toThrow(
            "No se puede eliminar"
        );
    });

    it("lanza error si el estudiante no existe", async () => {
        vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

        await expect(deleteStudent("stu-inexistente")).rejects.toThrow(
            "Estudiante no encontrado"
        );
        expect(prisma.student.delete).not.toHaveBeenCalled();
    });
});
