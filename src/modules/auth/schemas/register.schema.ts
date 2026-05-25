import { z } from "zod";
import { authRolesSchema } from "./login.schema";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
    role: z.enum(authRolesSchema).default("vendor"),
});

export type RegisterInput = z.infer<typeof registerSchema>;