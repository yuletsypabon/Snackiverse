"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

import { formatCurrency } from "@/lib/currency";
import { normalizeText } from "@/lib/text";
import { resolveProductEmoji } from "../constants/product-icons";
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
  const [query, setQuery] = useState("");

  const visibleProducts = query.trim()
    ? products.filter((p) => normalizeText(p.name).includes(normalizeText(query)))
    : products;
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
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <RestaurantMenuOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
            Productos
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            placeholder="Buscar producto por nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            type="button"
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{ whiteSpace: "nowrap" }}
          >
            Nuevo Producto
          </Button>
        </Stack>

        <TableContainer component={Paper} elevation={0} sx={{ p: { xs: 1, sm: 3 }, overflowX: "auto" }}>
          <Table sx={{ minWidth: 700, "& .MuiTableCell-root": { fontSize: 14 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ width: 60, fontWeight: 900, color: "#64748b" }}>Ícono</TableCell>
                <TableCell sx={{ fontWeight: 900, color: "#64748b" }}>Nombre</TableCell>
                <TableCell sx={{ width: 150, fontWeight: 900, color: "#64748b" }}>Categoría</TableCell>
                <TableCell sx={{ width: 120, fontWeight: 900, color: "#64748b" }}>Precio</TableCell>
                <TableCell sx={{ width: 100, fontWeight: 900, color: "#64748b" }}>Estado</TableCell>
                <TableCell sx={{ width: 110, fontWeight: 900, color: "#64748b" }}>Restricción</TableCell>
                <TableCell align="right" sx={{ width: 110, fontWeight: 900, color: "#64748b" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {visibleProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    sx={{ color: "text.secondary", py: 5, textAlign: "center" }}
                  >
                    {query.trim() ? "No se encontraron productos." : "No hay productos para mostrar."}
                  </TableCell>
                </TableRow>
              ) : (
                visibleProducts.map((product) => {
                  const emoji = resolveProductEmoji(product.icon);

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        opacity: product.isActive ? 1 : 0.55,
                      }}
                    >
                      <TableCell sx={{ width: 80 }}>
                        {emoji ? (
                          <Typography sx={{ fontSize: 22 }}>{emoji}</Typography>
                        ) : (
                          <RestaurantMenuOutlinedIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                        )}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 900, fontSize: 14 }}>{product.name}</Typography>
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
        <DialogTitle sx={{ fontSize: 18, fontWeight: 900, pb: 1 }}>
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
