import bcrypt from "bcrypt";

const SALT_ROUNDS = 10; // Level of hashing complexity, adjust as needed (higher is more secure but slower)

export async function hashPassword(password: string) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
    password: string,
    hashedPassword: string
) {
    return bcrypt.compare(password, hashedPassword);
}