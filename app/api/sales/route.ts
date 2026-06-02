import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyToken } from "@/modules/auth/utils/jwt";
import { createSale } from "@/modules/sales/services/sale.service";
import { createSaleSchema } from "@/modules/sales/schemas/sale.schema";

export async function POST(req: NextRequest) {
  try {
    // Cualquier usuario autenticado puede registrar ventas (admin o vendor)
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const vendorId = payload["userId"] as string | undefined;
    if (!vendorId) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const body = await req.json();
    const validated = createSaleSchema.parse(body);
    const sale = await createSale(validated, vendorId);

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: error.flatten() },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
