import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
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
 * Lee el token de las cookies y retorna el usuario de sesión.
 * Para usar en Server Components (páginas) — nunca en API routes.
 */
export async function getSessionUser(): Promise<{ userId: string; role: string; name: string } | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const session = await verifyToken(token);
    if (!session) return null;

    const userId = session["userId"] as string;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true },
    });
    if (!user) return null;

    return {
        userId,
        role: user.role,
        name: user.name,
    };
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
