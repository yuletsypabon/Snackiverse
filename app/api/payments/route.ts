import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin } from "@/lib/api-auth";
import { createPayment, listPayments } from "@/modules/payments/services/payment.service";

const createSchema = z.object({
  studentId: z.string().min(1),
  amount: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
  method: z.enum(["efectivo", "transferencia", "otro"]).default("efectivo"),
  note: z.string().optional().default(""),
});

export async function GET() {
  const authError = await authorizeAdmin();
  if (authError) return authError;
  const payments = await listPayments();
  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { studentId, amount, method, note } = createSchema.parse(body);
    const payment = await createPayment(studentId, amount, method, note);
    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
