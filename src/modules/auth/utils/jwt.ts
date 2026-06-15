import { SignJWT, jwtVerify } from "jose";

type TokenPayload = {
    userId: string;
    role: string;
};

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return new TextEncoder().encode(secret);
    }

    export async function generateToken(payload: TokenPayload) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(getJwtSecret());
    }

    export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret());

        return payload;
    } catch {
        return null;
    }
}
