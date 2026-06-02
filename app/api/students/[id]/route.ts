import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { authorizeAdmin, isPrismaNotFoundError } from "@/lib/api-auth";
import {
    deleteStudent,
    updateStudent,
} from "@/modules/students/services/student.service";
import { updateStudentSchema } from "@/modules/students/schemas/student.schema";

type StudentRouteContext = {
    params: Promise<{
        id: string;
    }>;
};

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
        await deleteStudent(id);

        return NextResponse.json({
            success: true,
            id,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Estudiante no encontrado") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Estudiante no encontrado.",
                    },
                    { status: 404 }
                );
            }

            if (error.message.includes("No se puede eliminar")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: error.message,
                    },
                    { status: 409 }
                );
            }
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
