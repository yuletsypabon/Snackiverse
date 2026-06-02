import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { authorizeAdmin } from "@/lib/api-auth";
import { createProductSchema } from "@/modules/products/schemas/product.schema";
import {
    createProduct,
    listProducts,
} from "@/modules/products/services/product.service";

export async function GET() {
    const unauthorized = await authorizeAdmin();
    if (unauthorized) return unauthorized;

    const products = await listProducts();

    return NextResponse.json({
        success: true,
        products,
    });
}

export async function POST(req: Request) {
    try {
        const unauthorized = await authorizeAdmin();
        if (unauthorized) return unauthorized;

        const body = await req.json();
        const validatedData = createProductSchema.parse(body);
        const product = await createProduct(validatedData);

        return NextResponse.json(
            { success: true, product },
            { status: 201 }
        );
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

        console.error(error);

        return NextResponse.json(
            { success: false, error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
