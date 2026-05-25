import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { verifyToken } from "@/modules/auth/utils/jwt";
import {
    deactivateStudent,
    updateStudent,
} from "@/modules/students/services/student.service";
import { updateStudentSchema } from "@/modules/students/schemas/student.schema";

type StudentRouteContext = {
    params: Promise<{
        id: string;
    }>;
};

async function authorizeAdmin() {
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

    return null;
}

function isPrismaNotFoundError(error: unknown) {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
    );
}

export async function PATCH(req: Request, context: StudentRouteContext) {
    try {
        const unauthorizedResponse = await authorizeAdmin();

        if (unauthorizedResponse) {
            return unauthorizedResponse;
        }

        const { id } = await context.params;
        const body = await req.json();
        const validatedData = updateStudentSchema.parse(body);
        const student = await updateStudent(id, validatedData);

        return NextResponse.json({
            success: true,
            student,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Revisa los datos del estudiante.",
                    details: error.flatten(),
                },
                { status: 400 }
            );
        }

        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Estudiante no encontrado.",
                },
                { status: 404 }
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

export async function DELETE(_req: Request, context: StudentRouteContext) {
    try {
        const unauthorizedResponse = await authorizeAdmin();

        if (unauthorizedResponse) {
            return unauthorizedResponse;
        }

        const { id } = await context.params;
        const student = await deactivateStudent(id);

        return NextResponse.json({
            success: true,
            student,
        });
    } catch (error) {
        if (isPrismaNotFoundError(error)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Estudiante no encontrado.",
                },
                { status: 404 }
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
