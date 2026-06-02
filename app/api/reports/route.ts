import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const { searchParams } = req.nextUrl;
  const studentId = searchParams.get("studentId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!studentId || !from || !to) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const [student, sales, recharges] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        grade: true,
        type: true,
        balance: true,
        guardianWhatsapp: true,
      },
    }),
    prisma.sale.findMany({
      where: {
        studentId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        total: true,
        createdAt: true,
        saleItems: {
          select: {
            quantity: true,
            unitPrice: true,
            subtotal: true,
            product: { select: { name: true, icon: true } },
          },
        },
      },
    }),
    prisma.recharge.findMany({
      where: {
        studentId,
        createdAt: { gte: fromDate, lte: toDate },
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, amount: true, note: true, createdAt: true },
    }),
  ]);

  if (!student) {
    return NextResponse.json({ error: "Estudiante no encontrado." }, { status: 404 });
  }

  const totalConsumed = sales.reduce((sum, s) => sum + s.total, 0);
  const totalRecharged = recharges.reduce((sum, r) => sum + r.amount, 0);

  return NextResponse.json({
    student,
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    totalConsumed,
    totalRecharged,
    recharges: recharges.map((r) => ({
      id: r.id,
      amount: r.amount,
      note: r.note,
      createdAt: r.createdAt.toISOString(),
    })),
    sales: sales.map((s) => ({
      id: s.id,
      total: s.total,
      createdAt: s.createdAt.toISOString(),
      items: s.saleItems.map((si) => ({
        name: si.product.name,
        icon: si.product.icon,
        quantity: si.quantity,
        unitPrice: si.unitPrice,
        subtotal: si.subtotal,
      })),
    })),
  });
}
