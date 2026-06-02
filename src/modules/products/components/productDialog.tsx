"use client";

import { Dialog, DialogContent, DialogTitle } from "@mui/material";

import type { ProductCategoryDto, ProductDto } from "../schemas/product.schema";
import ProductForm from "./productForm";

type ProductDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  categories: ProductCategoryDto[];
  products: ProductDto[];
  product?: ProductDto | null;
  onClose: () => void;
  onSuccess: (product: ProductDto) => void;
};

export default function ProductDialog({
  open,
  mode,
  categories,
  products,
  product,
  onClose,
  onSuccess,
}: ProductDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === "create" ? "Crear Producto" : "Editar Producto"}
      </DialogTitle>
      <DialogContent>
        <ProductForm
          mode={mode}
          categories={categories}
          products={products}
          product={product}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
