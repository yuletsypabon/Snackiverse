import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/utils/password";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword =
        await hashPassword("admin123");

    await prisma.user.upsert({
        where: {
        email: "admin@snackiverse.com",
        },
        update: {},
        create: {
        name: "Admin",
        email: "admin@snackiverse.com",
        password: hashedPassword,
        role: "admin",
        },
    });

    console.log("Admin user ready");
    }

    main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });