import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdmin } from "@/lib/api-auth";
import { updateVendorPassword } from "@/modules/vendors/services/vendor.service";

const changePasswordSchema = z.object({
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const unauthorized = await authorizeAdmin();
        if (unauthorized) return unauthorized;

        const { id } = await params;
        const body = await req.json();
        const validated = changePasswordSchema.parse(body);

        await updateVendorPassword(id, validated.password);

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: error.issues[0]?.message ?? "Datos inválidos." },
                { status: 400 }
            );
        }
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
