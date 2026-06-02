import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyToken } from "@/modules/auth/utils/jwt";

/**
 * Verifica que la petición venga de un usuario autenticado con rol admin.
 * Retorna una NextResponse de error si no está autorizado, o null si todo está bien.
 */
export async function authorizeAdmin(): Promise<NextResponse | null> {
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

/**
 * Detecta errores de "registro no encontrado" de Prisma (código P2025).
 */
export function isPrismaNotFoundError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2025"
    );
}
