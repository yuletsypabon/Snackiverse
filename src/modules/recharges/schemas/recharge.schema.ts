import { z } from "zod";

export const createRechargeSchema = z.object({
  studentId: z.string().min(1, "Selecciona un estudiante"),
  amount: z.coerce.number().int().min(100, "El monto mínimo es $100"),
  note: z.string().trim().optional(),
});

export type CreateRechargeInput = z.infer<typeof createRechargeSchema>;

export type RechargeDto = {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  amount: number;
  note: string | null;
  createdAt: string;
  balanceAfter: number;
};
