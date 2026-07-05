/**
 * reset.ts — Borra todos los registros excepto usuarios (admin/vendor).
 * Conserva: usuarios con rol admin.
 * Borra: SaleItem, Sale, Recharge, Payment, StudentRestriction,
 *         ProductTag, ComboItem, Student, Product, Tag, Category, vendors.
 *
 * Uso: npm run db:reset
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Iniciando reset completo (conservando usuarios)...\n");

  // El orden importa: primero tablas que referencian a otras (FKs)
  const saleItems        = await prisma.saleItem.deleteMany();
  const sales            = await prisma.sale.deleteMany();
  const recharges        = await prisma.recharge.deleteMany();
  const payments         = await prisma.payment.deleteMany();
  const restrictions     = await prisma.studentRestriction.deleteMany();
  const students         = await prisma.student.deleteMany();
  const productTags      = await prisma.productTag.deleteMany();
  const comboItems       = await prisma.comboItem.deleteMany();
  const products         = await prisma.product.deleteMany();
  const tags             = await prisma.tag.deleteMany();
  const categories       = await prisma.category.deleteMany();
  const vendors          = await prisma.user.deleteMany({ where: { role: "vendor" } });

  console.log(`✅ SaleItems eliminados      : ${saleItems.count}`);
  console.log(`✅ Ventas eliminadas         : ${sales.count}`);
  console.log(`✅ Recargas eliminadas       : ${recharges.count}`);
  console.log(`✅ Pagos eliminados          : ${payments.count}`);
  console.log(`✅ Restricciones eliminadas  : ${restrictions.count}`);
  console.log(`✅ Estudiantes eliminados    : ${students.count}`);
  console.log(`✅ ProductTags eliminados    : ${productTags.count}`);
  console.log(`✅ ComboItems eliminados     : ${comboItems.count}`);
  console.log(`✅ Productos eliminados      : ${products.count}`);
  console.log(`✅ Tags eliminados           : ${tags.count}`);
  console.log(`✅ Categorías eliminadas     : ${categories.count}`);
  console.log(`✅ Vendedores eliminados     : ${vendors.count}`);
  console.log("\n🎉 Listo. Solo queda el admin. La plataforma está limpia.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el reset:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
