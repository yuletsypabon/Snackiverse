import { z } from "zod";

export const createVendorSchema = z.object({
    name: z.string().trim().min(5, "El nombre debe tener al menos 5 caracteres"),
    email: z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    }).refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
    });

    export type CreateVendorInput = z.infer<typeof createVendorSchema>;

    export type VendorDto = {
    id: string;
    name: string;
    email: string;
    createdAt: string;
};