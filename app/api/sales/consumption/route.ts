import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@/modules/auth/utils/jwt";
import { prisma } from "@/lib/prisma";
import { createConsumptionSale } from "@/modules/sales/services/sale.service";
import { consumptionSaleSchema } from "@/modules/sales/schemas/sale.schema";

// Registrar una venta de consumo (monto directo). Solo vendedores con la marca canEnterConsumption.
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const payload = await verifyToken(token);
    const vendorId = payload?.["userId"] as string | undefined;
    if (!payload || !vendorId) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { canEnterConsumption: true },
    });
    if (!user?.canEnterConsumption) {
      return NextResponse.json({ error: "No tienes permiso para ingresar consumo." }, { status: 403 });
    }

    const body = await req.json();
    const validated = consumptionSaleSchema.parse(body);
    const sale = await createConsumptionSale(validated.studentId, validated.amount, vendorId);

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", details: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      if (error.message === "Estudiante no encontrado.")
        return NextResponse.json({ error: error.message }, { status: 404 });
      if (error.message === "El estudiante está inactivo.")
        return NextResponse.json({ error: error.message }, { status: 422 });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
