import { z } from "zod";

export const loginSchema = z.object({
    email: z.email(), // Validates that the input is a valid email address
    password: z.string().min(6), // Minimum password length of 6 characters
});

export type LoginInput = z.infer<typeof loginSchema>; // TypeScript type for the login input, inferred from the Zod schema

