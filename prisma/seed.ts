import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();



const categories = [
  { name: "Bebidas", slug: "bebidas" },
  { name: "Comidas rápidas", slug: "comidas-rapidas" },
  { name: "Dulces", slug: "dulces" },
  { name: "Panadería", slug: "panaderia" },
  { name: "Snacks", slug: "snacks" },
  { name: "Frutas", slug: "frutas" },
  { name: "Saludables", slug: "saludables" },
  { name: "Combos", slug: "combos" },
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name },
      create: {
        name: category.name,
        slug: category.slug,
      },
    });
  }

  console.log(`Seed completado. Categorías procesadas: ${categories.length}`);
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@snackiverse.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@snackiverse.com",
      password: hashedPassword,
      role: "admin",
    },
  });

console.log("Usuario admin creado: admin@snackiverse.com / admin123");
}

main()
  .catch((error) => {
    console.error("Error ejecutando seed de categorías:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


