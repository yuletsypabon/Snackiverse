import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { authorizeAdmin, isPrismaNotFoundError } from "@/lib/api-auth";
import { updateProductSchema } from "@/modules/products/schemas/product.schema";
import {
    deleteProduct,
    updateProduct,
} from "@/modules/products/services/product.service";

type ProductRouteContext = {
    params: Promise<{
        id: string;
    }>;
};

export async function PATCH(req: Request, context: ProductRouteContext) {
    try {
        const unauthorizedResponse = await authorizeAdmin();
        if (unauthorizedResponse) return unauthorizedResponse;

        const { id } = await context.params;
        const body = await req.json();
        const validatedData = updateProductSchema.parse(body);
        const product = await updateProduct(id, validatedData);

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Revisa los datos del producto.",
                    details: error.flatten(),
                },
                { status: 400 }
            );
        }

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { success: false, error: "Producto no encontrado." },
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

export async function DELETE(_req: Request, context: ProductRouteContext) {
    try {
        const unauthorizedResponse = await authorizeAdmin();
        if (unauthorizedResponse) return unauthorizedResponse;

        const { id } = await context.params;
        await deleteProduct(id);

        return NextResponse.json({
            success: true,
            id,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Producto no encontrado") {
                return NextResponse.json(
                    { success: false, error: "Producto no encontrado." },
                    { status: 404 }
                );
            }

            if (error.message.includes("No se puede eliminar")) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 409 }
                );
            }
        }

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                { success: false, error: "Producto no encontrado." },
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
