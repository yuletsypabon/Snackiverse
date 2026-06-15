import { prisma } from "@/lib/prisma";
import type { CreateSaleInput, SaleDto } from "../schemas/sale.schema";

export async function createSale(
  input: CreateSaleInput,
  vendorId: string
): Promise<SaleDto> {
  // 1. Obtener precios reales desde la BD (nunca confiar en el cliente)
  const productIds = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    select: { id: true, name: true, price: true },
  });

  if (products.length !== productIds.length) {
    throw new Error("Uno o más productos no existen o están inactivos.");
  }

  const priceMap = new Map(products.map((p) => [p.id, p]));

  // 2. Calcular items con precios reales
  const resolvedItems = input.items.map((item) => {
    const product = priceMap.get(item.productId)!;
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal: product.price * item.quantity,
    };
  });

  const total = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);

  // 3. Transacción atómica: venta + descuento de saldo si es prepago
  const sale = await prisma.$transaction(async (tx) => {
    // Descontar saldo si hay estudiante prepago
    if (input.studentId) {
      const student = await tx.student.findUnique({
        where: { id: input.studentId },
        select: { type: true, balance: true, isActive: true },
      });

      if (!student) throw new Error("Estudiante no encontrado.");
      if (!student.isActive) throw new Error("El estudiante está inactivo.");

      if (student.type === "prepaid") {
        await tx.student.update({
          where: { id: input.studentId },
          data: { balance: { decrement: total } },
        });
      }
    }

    // Crear la venta con sus ítems
    return tx.sale.create({
      data: {
        studentId: input.studentId ?? null,
        vendorId,
        total,
        saleItems: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
        },
      },
      select: {
        id: true,
        studentId: true,
        vendorId: true,
        total: true,
        createdAt: true,
        vendor: { select: { name: true } },
        saleItems: {
          select: {
            productId: true,
            quantity: true,
            unitPrice: true,
            subtotal: true,
            product: { select: { name: true } },
          },
        },
      },
    });
  });

  return {
    id: sale.id,
    studentId: sale.studentId,
    vendorId: sale.vendorId,
    vendorName: sale.vendor.name,
    total: sale.total,
    createdAt: sale.createdAt.toISOString(),
    items: sale.saleItems.map((si) => ({
      productId: si.productId,
      productName: si.product.name,
      quantity: si.quantity,
      unitPrice: si.unitPrice,
      subtotal: si.subtotal,
    })),
  };
}
