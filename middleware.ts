import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/modules/auth/utils/jwt";

const adminOnlyRoutes = [
    "/dashboard",
    "/students",
    "/reports",
    "/reports-center",
    "/users",
    "/products",
    "/catalog",
    "/payments",
    "/recharges",
];

const protectedRoutes = [
    "/dashboard",
    "/students",
    "/sales",
    "/reports",
    "/reports-center",
    "/users",
    "/products",
    "/catalog",
    "/payments",
    "/recharges",
];

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const pathname = req.nextUrl.pathname;

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const verified = await verifyToken(token);

    if (!verified) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (
        adminOnlyRoutes.some((route) => pathname.startsWith(route)) &&
        verified.role !== "admin"
    ) {
        return NextResponse.redirect(new URL("/sales", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/students/:path*",
        "/sales/:path*",
        "/reports/:path*",
        "/reports-center/:path*",
        "/users/:path*",
        "/products/:path*",
        "/catalog/:path*",
        "/payments/:path*",
        "/recharges/:path*",
    ],
};
