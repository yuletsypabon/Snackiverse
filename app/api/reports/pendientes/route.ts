import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!type || !from || !to) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  if (!["monthly", "biweekly", "weekly"].includes(type)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }

  // Interpretar las fechas en zona horaria de Colombia (UTC-5, sin horario de verano),
  // para cubrir el día completo local sin importar la zona horaria del servidor.
  const fromDate = new Date(`${from}T00:00:00.000-05:00`);
  const toDate = new Date(`${to}T23:59:59.999-05:00`);

  const students = await prisma.student.findMany({
    where: { isActive: true, type: type as "monthly" | "biweekly" | "weekly" },
    select: {
      id: true,
      name: true,
      grade: true,
      type: true,
      guardianWhatsapp: true,
      sales: {
        where: { createdAt: { gte: fromDate, lte: toDate } },
        select: { total: true },
      },
      payments: {
        where: { createdAt: { gte: fromDate, lte: toDate } },
        select: { amount: true },
      },
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  const result = students.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    type: s.type,
    guardianWhatsapp: s.guardianWhatsapp,
    totalConsumed: s.sales.reduce((sum, sale) => sum + sale.total, 0),
    totalPaid: s.payments.reduce((sum, p) => sum + p.amount, 0),
  }));

  return NextResponse.json({ students: result });
}
