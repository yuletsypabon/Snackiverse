import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { loginUser } from "@/modules/auth/services/auth.service";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validatedData =
        loginSchema.parse(body);

        const result = await loginUser(
        validatedData.email,
        validatedData.password
        );

        const response = NextResponse.json({
        success: true,
        user: result.user,
        });

        response.cookies.set("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        });

        return response;
    } catch (error) {
        if (error instanceof SyntaxError) {
        return NextResponse.json(
            {
            success: false,
            error: "Invalid JSON",
            },
            { status: 400 }
        );
        }

        if (error instanceof ZodError) {
        return NextResponse.json(
            {
            success: false,
            error: error.flatten(),
            },
            { status: 400 }
        );
        }

        if (
        error instanceof Error &&
        error.message ===
            "Invalid credentials"
        ) {
        return NextResponse.json(
            {
            success: false,
            error: error.message,
            },
            { status: 401 }
        );
        }

        console.error(error);

        return NextResponse.json(
        {
            success: false,
            error: "Internal server error",
        },
        { status: 500 }
        );
    }
}