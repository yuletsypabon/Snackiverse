import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
    prisma: PrismaClient; // Type assertion to ensure TypeScript understands the structure of the global object
};

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient();

if (process.env.NODE_ENV !== "production") { // Only assign the Prisma client to the global object in development to prevent multiple instances during hot reloads
    globalForPrisma.prisma = prisma;
}