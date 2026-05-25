import { z } from "zod";

export const studentTypesSchema = [
    "prepaid",
    "weekly",
    "monthly",
    "beweekly",
] as const;

export type StudentType = (typeof studentTypesSchema)[number];

export const studentTypeLabels: Record<StudentType, string> = {
    prepaid: "Prepago",
    weekly: "Semanal",
    monthly: "Mensual",
    beweekly: "Quincenal",
};

const studentBalanceSchema = z.coerce
    .number()
    .int("El saldo debe ser un numero entero")
    .min(0, "El saldo no puede ser negativo")
    .default(0);

export const createStudentSchema = z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
    grade: z.string().trim().min(1, "El grado es obligatorio"),
    type: z.enum(studentTypesSchema).default("prepaid"),
    balance: studentBalanceSchema,
    foodRestriction: z.string().trim().optional(),
    guardianWhatsapp: z.string().trim().optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export type StudentDto = {
    id: string;
    name: string;
    grade: string;
    type: StudentType;
    balance: number;
    isActive: boolean;
    foodRestriction: string | null;
    guardianWhatsapp: string | null;
    createdAt: string;
    salesCount: number;
    rechargesCount: number;
    paymentsCount: number;
};
