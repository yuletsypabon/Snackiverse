import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { verifyToken } from "@/modules/auth/utils/jwt";
import { createStudentSchema } from "@/modules/students/schemas/student.schema";
import {
    createStudent,
    listStudents,
    } from "@/modules/students/services/student.service";

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

    export async function GET() {
    const unauthorized = await authorizeAdmin();
    if (unauthorized) return unauthorized;

    const students = await listStudents();

    return NextResponse.json({
        success: true,
        students,
    });
    }

    export async function POST(req: Request) {
    try {
        const unauthorized = await authorizeAdmin();
        if (unauthorized) return unauthorized;

        const body = await req.json();
        const validatedData = createStudentSchema.parse(body);
        const student = await createStudent(validatedData);

        return NextResponse.json(
        { success: true, student },
        { status: 201 }
        );
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

        console.error(error);

        return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
        );
    }
}