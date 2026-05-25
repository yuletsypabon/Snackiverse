import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { registerSchema } from "@/modules/auth/schemas/register.schema";
import { registerUser } from "@/modules/auth/services/auth.service";
import { verifyToken } from "@/modules/auth/utils/jwt";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
        return NextResponse.json(
            { success: false, error: "No autenticado." },
            { status: 401 }
        );
        }

        const session = await verifyToken(token);

        if (!session || session.role !== "admin") {
        return NextResponse.json(
            { success: false, error: "No autorizado." },
            { status: 403 }
        );
        }

        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        const user = await registerUser(
        validatedData.name,
        validatedData.email,
        validatedData.password,
        validatedData.role
        );

        return NextResponse.json(
        {
            success: true,
            user,
        },
        { status: 201 }
        );
    } catch (error) {
        if (error instanceof ZodError) {
        return NextResponse.json(
            {
            success: false,
            error: "Revisa los datos del formulario.",
            },
            { status: 400 }
        );
        }

        if (error instanceof Error && error.message === "User already exists") {
        return NextResponse.json(
            {
            success: false,
            error: "Ya existe una cuenta con ese correo.",
            },
            { status: 409 }
        );
        }

        console.error(error);

        return NextResponse.json(
        {
            success: false,
            error: "Error interno del servidor.",
        },
        { status: 500 }
        );
    }
}