import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/utils/password";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await hashPassword("admin123");

    await prisma.user.create({
        data: {
        name: "Admin",
        email: "admin@snackieverse.com",
        password: hashedPassword,
        role: "admin",
        },
    });

    console.log("Admin user created");
    }

    main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });