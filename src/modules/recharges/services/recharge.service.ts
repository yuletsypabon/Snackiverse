import { prisma } from "@/lib/prisma";
import type { CreateRechargeInput, RechargeDto } from "../schemas/recharge.schema";

export async function createRecharge(input: CreateRechargeInput): Promise<RechargeDto> {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    select: { id: true, name: true, grade: true, type: true, isActive: true, balance: true },
  });

  if (!student) throw new Error("Estudiante no encontrado.");
  if (!student.isActive) throw new Error("El estudiante está inactivo.");

  const [recharge, updated] = await prisma.$transaction([
    prisma.recharge.create({
      data: {
        studentId: input.studentId,
        amount: input.amount,
        note: input.note?.trim() || null,
      },
    }),
    prisma.student.update({
      where: { id: input.studentId },
      data: { balance: { increment: input.amount } },
      select: { balance: true },
    }),
  ]);

  return {
    id: recharge.id,
    studentId: student.id,
    studentName: student.name,
    studentGrade: student.grade,
    amount: recharge.amount,
    note: recharge.note,
    createdAt: recharge.createdAt.toISOString(),
    balanceAfter: updated.balance,
  };
}

export async function listRecentRecharges(limit = 30): Promise<RechargeDto[]> {
  const recharges = await prisma.recharge.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      note: true,
      createdAt: true,
      student: { select: { id: true, name: true, grade: true, balance: true } },
    },
  });

  return recharges.map((r) => ({
    id: r.id,
    studentId: r.student.id,
    studentName: r.student.name,
    studentGrade: r.student.grade,
    amount: r.amount,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
    balanceAfter: r.student.balance,
  }));
}
