import { z } from "zod";

const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),

  price: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo")
    .max(999999, "El precio es muy alto"),

  categoryId: z
    .string()
    .trim()
    .optional()
    .nullable(),

  icon: z
    .string()
    .trim()
    .max(40, "El ícono no puede exceder 40 caracteres")
    .optional()
    .nullable(),

  // IDs de los productos que componen este combo (vacío si no es combo)
  comboItemIds: z.array(z.string().trim()).optional().default([]),
  tagIds: z.array(z.string()).optional().default([]),
  


});

export const createProductSchema = productBaseSchema.extend({
  isActive: z.boolean().default(true),

});

export const updateProductSchema = productBaseSchema.partial().extend({
  isActive: z.boolean().optional(),

});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export type ProductTagDto = {
  id: string;
  name: string;
};


export type ProductCategoryDto = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

export type ProductComboItemDto = {
  id: string;
  name: string;
  price: number;
  icon: string | null;
};

export type ProductDto = {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  category: ProductCategoryDto | null;
  icon: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  saleCount: number;
  // Lista de productos que componen este combo (vacía si no es combo)
  comboItems: ProductComboItemDto[];
  tags: ProductTagDto[];
  
};

// Export the form values type (for components)
export type ProductFormValues = CreateProductInput;
