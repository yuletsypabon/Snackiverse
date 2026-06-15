import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRecharge } from "../recharge.service";

// ─── Mock de Prisma ───────────────────────────────────────────────────────────
// createRecharge usa la forma de array: prisma.$transaction([recharge.create, student.update])
// Por eso se necesita mockear student.update además de $transaction.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    student: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    recharge: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const STUDENT_ROW = {
  id: "stu-1",
  name: "Kevin Salazar",
  grade: "1A",
  type: "prepaid",
  isActive: true,
  balance: -10000,
};

const RECHARGE_ROW = {
  id: "rec-1",
  studentId: "stu-1",
  amount: 6000,
  note: null,
  createdAt: new Date("2026-06-09"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── CP-09: Pago parcial de deuda actualiza saldo correctamente ───────────────
describe("CP-09 — Pago parcial de deuda actualiza saldo correctamente", () => {
  beforeEach(() => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(STUDENT_ROW as never);
    vi.mocked(prisma.recharge.create).mockResolvedValue(RECHARGE_ROW as never);
    vi.mocked(prisma.student.update).mockResolvedValue({ balance: -4000 } as never);
    // Simula el comportamiento real: ejecuta todas las promesas del array
    vi.mocked(prisma.$transaction).mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops));
  });

  it("saldo pasa de -10000 a -4000 tras recarga de 6000", async () => {
    const result = await createRecharge({ studentId: "stu-1", amount: 6000 });

    expect(result.amount).toBe(6000);
    expect(result.balanceAfter).toBe(-4000);
  });

  it("no resetea el saldo a 0 si la recarga es menor que la deuda", async () => {
    const result = await createRecharge({ studentId: "stu-1", amount: 6000 });

    expect(result.balanceAfter).toBe(-4000);
    expect(result.balanceAfter).not.toBe(0);
  });

  it("llama a student.update con increment del monto correcto", async () => {
    await createRecharge({ studentId: "stu-1", amount: 6000 });

    expect(prisma.student.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { balance: { increment: 6000 } },
      })
    );
  });

  it("lanza error si el estudiante no existe", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue(null);

    await expect(createRecharge({ studentId: "no-existe", amount: 6000 }))
      .rejects.toThrow("Estudiante no encontrado.");
  });

  it("lanza error si el estudiante está inactivo", async () => {
    vi.mocked(prisma.student.findUnique).mockResolvedValue({
      ...STUDENT_ROW,
      isActive: false,
    } as never);

    await expect(createRecharge({ studentId: "stu-1", amount: 6000 }))
      .rejects.toThrow("El estudiante está inactivo.");
  });
});
