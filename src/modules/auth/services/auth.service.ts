import { prisma } from "@/lib/prisma";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import type { AuthRole } from "../schemas/login.schema";
import { hashPassword } from "../utils/password";

export async function loginUser(
    email: string,
    password: string,
    role: AuthRole
) {

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValidPassword = await comparePassword(
        password,
        user.password
    );

    if (!isValidPassword) {
        throw new Error("Invalid credentials");
    }

    if (user.role !== role) {
        throw new Error("Invalid role");
    }
    
    const token = await generateToken({
        userId: user.id,
        role: user.role,
    });

    return {
        token,
        user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        },
    };
}

export async function registerUser(
    name: string,
    email: string,
    password: string,
    role: AuthRole
    ) {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
        name,
        email,
        password: hashedPassword,
        role,
        },
    });

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
}