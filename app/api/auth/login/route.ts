import { NextResponse } from "next/server";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import { loginUser } from "@/modules/auth/services/auth.service";

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get("content-type");
        console.log("Request headers - Content-Type:", contentType);
        console.log("Request method:", req.method);
        
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            console.error("Content-Type:", contentType);
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid JSON in request body",
                    details: (parseError as Error).message,
                },
                { status: 400 }
            );
        }

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
        console.error("Login error:", error);
        return NextResponse.json(
        {
            success: false,
            error: error instanceof Error ? error.message : "Invalid credentials",
        },
        { status: 401 }
        );
    }
}