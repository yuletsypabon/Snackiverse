import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/modules/auth/utils/jwt";

// ── Rate limiting ────────────────────────────────────────────────────────────
type RateEntry = { count: number; windowStart: number };
const rl = new Map<string, RateEntry>();

const RATE_LIMITS: Array<{ prefix: string; max: number; windowMs: number }> = [
    { prefix: "/api/auth/login", max: 10,  windowMs: 15 * 60_000 }, // 10 intentos / 15 min
    { prefix: "/api/",           max: 200, windowMs: 60_000 },       // 200 req / min
];

function isRateLimited(ip: string, pathname: string): boolean {
    const rule = RATE_LIMITS.find((r) => pathname.startsWith(r.prefix));
    if (!rule) return false;

    const key = `${ip}|${rule.prefix}`;
    const now = Date.now();
    const entry = rl.get(key);

    if (!entry || now - entry.windowStart > rule.windowMs) {
        rl.set(key, { count: 1, windowStart: now });
        return false;
    }

    if (entry.count >= rule.max) return true;

    entry.count++;
    return false;
}

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
    const pathname = req.nextUrl.pathname;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip, pathname)) {
        return new NextResponse("Too Many Requests", {
            status: 429,
            headers: { "Retry-After": "60" },
        });
    }

    const token = req.cookies.get("token")?.value;

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
        "/api/:path*",
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
