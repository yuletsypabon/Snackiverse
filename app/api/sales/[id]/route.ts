import { NextResponse } from "next/server";

import { authorizeAdmin, isPrismaNotFoundError } from "@/lib/api-auth";
import { deleteSale } from "@/modules/sales/services/sale.service";

type SaleRouteContext = {
    params: Promise<{
        id: string;
    }>;
};

// Solo admin: elimina una venta (de cualquier vendedor) y revierte el saldo.
export async function DELETE(_req: Request, context: SaleRouteContext) {
    try {
        const unauthorizedResponse = await authorizeAdmin();

        if (unauthorizedResponse) {
            return unauthorizedResponse;
        }

        const { id } = await context.params;
        await deleteSale(id);

        return NextResponse.json({ success: true, id });
    } catch (error) {
        if (error instanceof Error && error.message === "Venta no encontrada") {
            return NextResponse.json(
                { success: false, error: "Venta no encontrada." },
                { status: 404 }
            );
        }

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { success: false, error: "Venta no encontrada." },
                { status: 404 }
            );
        }

        console.error(error);

        return NextResponse.json(
            { success: false, error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
