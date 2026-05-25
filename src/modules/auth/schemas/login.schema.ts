import { z } from "zod";

export const authRolesSchema = ["admin", "vendor"] as const; // Defines an enum for user roles
export type AuthRole = typeof authRolesSchema[number]; // TypeScript type for user roles, derived from the authRolesSchema array


export const loginSchema = z.object({
    email: z.email(), // Validates that the input is a valid email address
    password: z.string().min(6), // Minimum password length of 6 characters
    role: z.enum(authRolesSchema),
});

export type LoginInput = z.infer<typeof loginSchema>; // TypeScript type for the login input, inferred from the Zod schema

