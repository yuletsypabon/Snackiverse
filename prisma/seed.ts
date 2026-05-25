import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/utils/password";

const prisma = new PrismaClient();

async function main() {
    const adminPassword =  await hashPassword("admin123");
    const vendorPassword = await hashPassword("vendor123");

    await prisma.user.upsert({
        where: {
        email: "admin@snackiverse.com",
        },
        update: {},
        create: {
            name: "Admin",
            email: "admin@snackiverse.com",
            password: adminPassword,
            role: "admin",
        },
        
    });

    await prisma.user.upsert({
        where: {
            email: "vendedor@snackiverse.com",
        },
        update: {
            
        },
        create: {
            name: "Vendedor",
            email: "vendedor@snackiverse.com",
            password: vendorPassword,
            role: "vendor",
        },
    });

    console.log("Admin user ready");
}

    main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });