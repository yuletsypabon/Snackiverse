import { prisma } from "@/lib/prisma";

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
  const row = await prisma.payment.create({
    data: {
      studentId,
      amount,
      note: encodeNote(method, noteText),
    },
    select: paymentSelect,
  });
  return toDto(row);
}
