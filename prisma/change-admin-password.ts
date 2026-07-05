/**
 * change-admin-password.ts — Cambia la contraseña del usuario admin.
 *
 * Uso: npm run db:admin-password -- "nueva_contraseña"
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const newPassword = process.argv[2];

  if (!newPassword) {
    console.error("❌ Debes pasar la nueva contraseña como argumento.");
    console.error('   Ejemplo: npm run db:admin-password -- "mi_contraseña"');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  const result = await prisma.user.updateMany({
    where: { role: "admin" },
    data: { password: hashed },
  });

  if (result.count === 0) {
    console.error("❌ No se encontró ningún usuario admin.");
    process.exit(1);
  }

  console.log(`✅ Contraseña actualizada para ${result.count} admin(s).`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
