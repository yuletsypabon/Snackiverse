import { prisma } from "@/lib/prisma";
import { nextBusinessDay, calculateExpiresAt } from "@/modules/students/services/student.service";

export type PaymentDto = {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  amount: number;
  method: string;
  note: string | null;
  createdAt: string;
};

// El método de pago se almacena como prefijo en el campo note: "efectivo|nota"
function encodeNote(method: string, note: string): string {
  return note.trim() ? `${method}|${note.trim()}` : method;
}

function decodeNote(raw: string | null): { method: string; note: string | null } {
  if (!raw) return { method: "efectivo", note: null };
  const idx = raw.indexOf("|");
  if (idx === -1) return { method: raw, note: null };
  return { method: raw.slice(0, idx), note: raw.slice(idx + 1) || null };
}

const paymentSelect = {
  id: true,
  studentId: true,
  amount: true,
  note: true,
  createdAt: true,
  student: { select: { name: true, grade: true } },
} satisfies import("@prisma/client").Prisma.PaymentSelect;

type PaymentRow = import("@prisma/client").Prisma.PaymentGetPayload<{ select: typeof paymentSelect }>;

function toDto(p: PaymentRow): PaymentDto {
  const { method, note } = decodeNote(p.note);
  return {
    id: p.id,
    studentId: p.studentId,
    studentName: p.student.name,
    studentGrade: p.student.grade,
    amount: p.amount,
    method,
    note,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function listPayments(limit = 50): Promise<PaymentDto[]> {
  const rows = await prisma.payment.findMany({
    select: paymentSelect,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toDto);
}

export async function createPayment(
  studentId: string,
  amount: number,
  method: string,
  noteText: string
): Promise<PaymentDto> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { type: true, balance: true },
  });

  const isTiquetera = student?.type && ["weekly", "biweekly", "monthly"].includes(student.type);
  const newExpiresAt = isTiquetera
    ? calculateExpiresAt(student!.type, nextBusinessDay(new Date()))
    : undefined;

  // Estudiante de pago anticipado con deuda (saldo negativo): el pago abona a la
  // deuda (cada abono la reduce). No pasa de 0 — para agregar crédito se usan las
  // recargas. El historial de consumo (las ventas) no se toca.
  const hasDebt = !!student && !isTiquetera && student.balance < 0;
  const newBalance = hasDebt
    ? Math.min(0, student!.balance + amount)
    : undefined;

  const [row] = await prisma.$transaction([
    prisma.payment.create({
      data: {
        studentId,
        amount,
        note: encodeNote(method, noteText),
      },
      select: paymentSelect,
    }),
    ...(isTiquetera && newExpiresAt
      ? [prisma.student.update({
          where: { id: studentId },
          data: { tiqueteraExpiresAt: newExpiresAt },
        })]
      : []),
    ...(newBalance !== undefined
      ? [prisma.student.update({
          where: { id: studentId },
          data: { balance: newBalance },
        })]
      : []),
  ]);

  return toDto(row);
}
