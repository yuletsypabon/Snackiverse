"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { formatCurrency } from "@/lib/currency";
import { getProductIconOption } from "../constants/product-icons";
import type {
  ProductCategoryDto,
  ProductDto,
  ProductTagDto,
} from "../schemas/product.schema";
import ProductDialog from "./productDialog";
import { TagDrawer } from "@/modules/tags/components/tag-drawer";
import type { TagDto } from "@/modules/tags/schemas/tag.schema";

type ProductTableProps = {
  initialProducts: ProductDto[];
  categories: ProductCategoryDto[];
  tags: ProductTagDto[];
};

type NoticeState = {
  message: string;
  severity: "success" | "error";
} | null;

function sortProducts(products: ProductDto[]) {
  return [...products].sort((a, b) => {
    if (a.isActive !== b.isActive) {
      return Number(b.isActive) - Number(a.isActive);
    }

    return a.name.localeCompare(b.name, "es");
  });
}

export function ProductTable({ initialProducts, categories, tags: initialTags }: ProductTableProps) {
  const [products, setProducts] = useState(() => sortProducts(initialProducts));
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [tags, setTags] = useState<TagDto[]>(initialTags);
  const [isTagDrawerOpen, setIsTagDrawerOpen] = useState(false);
  const [productPendingDelete, setProductPendingDelete] = useState<ProductDto | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const openCreateDialog = () => {
    setDialogMode("create");
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: ProductDto) => {
    setDialogMode("edit");
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
  };

  const showNotice = (message: string, severity: "success" | "error" = "success") => {
    setNotice({ message, severity });
  };

  const upsertProduct = (product: ProductDto) => {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      const nextProducts = exists
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current];

      return sortProducts(nextProducts);
    });

    showNotice(
      dialogMode === "create"
        ? "Producto creado correctamente."
        : "Producto actualizado correctamente.",
      "success"
    );
  };

  const requestDeleteProduct = (product: ProductDto) => {
    setProductPendingDelete(product);
  };

  const closeDeleteDialog = () => {
    if (deletingProduct) {
      return;
    }

    setProductPendingDelete(null);
  };

  const deleteProduct = async () => {
    const product = productPendingDelete;

    if (!product) {
      return;
    }

    setDeletingProduct(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        showNotice(data.error ?? "No se pudo eliminar el producto.", "error");
        return;
      }

      setProducts((current) => current.filter((item) => item.id !== product.id));
      setProductPendingDelete(null);
      showNotice("Producto eliminado correctamente.", "success");
    } catch {
      showNotice("No se pudo eliminar el producto.", "error");
    } finally {
      setDeletingProduct(false);
    }
  };

  return (
    <>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <RestaurantMenuOutlinedIcon sx={{ fontSize: 34, color: "#0a2540" }} />
            <Typography
              component="h1"
              sx={{
                color: "#0a2540",
                fontSize: { xs: 28, md: 34 },
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              Productos
            </Typography>
          </Stack>

          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<LabelOutlinedIcon />}
            onClick={() => setIsTagDrawerOpen(true)}
          >
            Etiquetas
          </Button>
          <Button
            type="button"
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
          >
            Nuevo Producto
          </Button>
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ p: 3 }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 60 }}>Ícono</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell sx={{ width: 150 }}>Categoría</TableCell>
                <TableCell sx={{ width: 120 }}>Precio</TableCell>
                <TableCell sx={{ width: 100 }}>Estado</TableCell>
                <TableCell sx={{ width: 110 }}>Restricción</TableCell>
                <TableCell align="right" sx={{ width: 110 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ color: "text.secondary", py: 5, textAlign: "center" }}
                  >
                    No hay productos para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const iconOption = getProductIconOption(product.icon);
                  const ProductIcon = iconOption?.Icon ?? RestaurantMenuOutlinedIcon;

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        opacity: product.isActive ? 1 : 0.55,
                      }}
                    >
                      <TableCell sx={{ width: 80 }}>
                        {iconOption || !product.icon ? (
                          <ProductIcon fontSize="small" />
                        ) : (
                          <Typography sx={{ fontSize: 18 }}>{product.icon}</Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 900 }}>{product.name}</Typography>
                        {product.comboItems.length > 0 && (
                        <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
                          {product.comboItems.map((ci) => ci.name).join(" + ")}
                        </Typography> )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={product.category?.name ?? "sin categoría"}
                          size="small"
                          sx={{
                            bgcolor: "#d8ecfb",
                            color: "#0065a8",
                            fontWeight: 900,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ color: "#00a63e", fontWeight: 900 }}>
                        {formatCurrency(product.price)}
                      </TableCell>


                      <TableCell>
                        <Chip
                          label={product.isActive ? "Activo" : "Inactivo"}
                          size="small"
                          sx={{
                            bgcolor: product.isActive ? "#d7f4e4" : "#fde1dd",
                            color: product.isActive ? "#008c49" : "#bf1f14",
                            fontWeight: 900,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {product.tags.length > 0 ? (
                          <Chip
                            label="Sí"
                            size="small"
                            sx={{ bgcolor: "#fde1dd", color: "#bf1f14", fontWeight: 900 }}
                          />
                        ) : (
                          <Chip
                            label="No"
                            size="small"
                            sx={{ bgcolor: "#f1f5f9", color: "#64748b", fontWeight: 900 }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <IconButton
                            aria-label={`Editar ${product.name}`}
                            onClick={() => openEditDialog(product)}
                            sx={{
                              bgcolor: "#299fe8",
                              color: "white",
                              "&:hover": { bgcolor: "#1688cf" },
                            }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            aria-label={`Eliminar ${product.name}`}
                            onClick={() => requestDeleteProduct(product)}
                            sx={{
                              bgcolor: "#e74c3c",
                              color: "white",
                              "&:hover": { bgcolor: "#d63e30" },
                            }}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Dialog
        open={Boolean(productPendingDelete)}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontSize: 24, fontWeight: 900, pb: 1 }}>
          Confirmar eliminación
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "text.secondary" }}>
            {productPendingDelete
              ? `¿Eliminar definitivamente el producto "${productPendingDelete.name}"?`
              : ""}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            type="button"
            variant="contained"
            color="inherit"
            onClick={closeDeleteDialog}
            disabled={deletingProduct}
            sx={{ px: 3 }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={deleteProduct}
            disabled={deletingProduct}
            sx={{ px: 3 }}
          >
            {deletingProduct ? "Eliminando" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ProductDialog
        open={isDialogOpen}
        mode={dialogMode}
        categories={categories}
        products={products}
        product={selectedProduct}
        onClose={closeDialog}
        onSuccess={upsertProduct}
      />
      <TagDrawer
        open={isTagDrawerOpen}
        tags={tags}
        onClose={() => setIsTagDrawerOpen(false)}
        onTagCreated={(tag) => setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name, "es")))}
        onTagDeleted={(id) => setTags((prev) => prev.filter((t) => t.id !== id))}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={2800}
        onClose={(_event, reason) => {
          if (reason === "clickaway") {
            return;
          }

          setNotice(null);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={notice?.severity ?? "success"}
          onClose={() => setNotice(null)}
          sx={{ width: "100%" }}
        >
          {notice?.message ?? ""}
        </Alert>
      </Snackbar>
    </>
  );
}
