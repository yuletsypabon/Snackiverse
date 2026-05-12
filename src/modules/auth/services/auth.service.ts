import { prisma } from "@/lib/prisma";
import { comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
export async function loginUser(
    email: string,
    password: string
    ) {
    console.log("LOGIN ATTEMPT");

    const user = await prisma.user.findUnique({
        where: { email },
    });

    console.log("USER:", user);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isValidPassword = await comparePassword(
        password,
        user.password
    );

    console.log("PASSWORD VALID:", isValidPassword);

    if (!isValidPassword) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
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