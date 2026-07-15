import { z } from "zod";

export const createSaleSchema = z.object({
  studentId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().min(1),
    })
  ).min(1, "El carrito no puede estar vacío"),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;

export type SaleItemDto = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type SaleDto = {
  id: string;
  studentId: string | null;
  vendorId: string;
  vendorName: string;
  total: number;
  createdAt: string;
  items: SaleItemDto[];
};


// Venta de "consumo": un monto directo, sin productos. Solo para vendedores con la marca.
export const consumptionSaleSchema = z.object({
  studentId: z.string().min(1, "Selecciona un estudiante"),
  amount: z.coerce.number().int().positive("El monto debe ser mayor a 0"),
});

export type ConsumptionSaleInput = z.infer<typeof consumptionSaleSchema>;
