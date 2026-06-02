import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Faltan parámetros." }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const sales = await prisma.sale.findMany({
    where: { createdAt: { gte: fromDate, lte: toDate } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      total: true,
      createdAt: true,
      student: { select: { name: true, grade: true, guardianWhatsapp: true } },
      vendor: { select: { name: true } },
      saleItems: {
        select: {
          quantity: true,
          unitPrice: true,
          subtotal: true,
          product: { select: { name: true } },
        },
      },
    },
  });

  // Una fila por ítem de venta
  const rows = sales.flatMap((s) =>
    s.saleItems.map((si) => ({
      saleId: s.id,
      createdAt: s.createdAt.toISOString(),
      studentName: s.student?.name ?? "Venta libre",
      studentGrade: s.student?.grade ?? "—",
      guardianWhatsapp: s.student?.guardianWhatsapp ?? null,
      productName: si.product.name,
      quantity: si.quantity,
      unitPrice: si.unitPrice,
      subtotal: si.subtotal,
      vendorName: s.vendor.name,
    }))
  );

  return NextResponse.json({ rows });
}
