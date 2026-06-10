"use client";

import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState, useMemo, useRef, useEffect } from "react";

import { formatCurrency } from "@/lib/currency";
import { getProductIconOption } from "@/modules/products/constants/product-icons";
import type { ProductDto, ProductCategoryDto } from "@/modules/products/schemas/product.schema";
import type { StudentDto } from "@/modules/students/schemas/student.schema";

function ProductIcon({ iconId, size }: { iconId: string | null; size: number }) {
  const option = iconId ? getProductIconOption(iconId) : null;
  if (!option) {
    return (
      <ShoppingBagOutlinedIcon sx={{ fontSize: size, color: "#475569" }} />
    );
  }
  const Icon = option.Icon;
  return <Icon sx={{ fontSize: size, color: "#475569" }} />;
}

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  icon: string | null;
};

type Props = {
  products: ProductDto[];
  categories: ProductCategoryDto[];
  students: StudentDto[];
};


export function SaleRegister({ products, categories, students }: Props) {
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentDto | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<{ vendorName: string; createdAt: string; total: number; remainingBalance: number | null } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const studentInputRef = useRef<HTMLDivElement>(null);

  const restrictedTagIds = useMemo(
    () => new Set(selectedStudent?.restrictions.map((r) => r.id) ?? []),
    [selectedStudent]
  );

  const isRestricted = (product: ProductDto) =>
    product.tags.some((t) => restrictedTagIds.has(t.id));

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter((s) => s.isActive && s.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [students, studentQuery]);

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isActive) return false;
      if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
      if (productQuery) {
        const q = productQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, selectedCategoryId, productQuery]);

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      if (!p.isActive) return;
      if (p.categoryId) map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    });
    return map;
  }, [products]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const addToCart = (product: ProductDto) => {
    if (isRestricted(product)) return;
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === product.id);
      if (exists) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { productId: product.id, name: product.name, price: product.price, quantity: 1, icon: product.icon },
      ];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const selectStudent = (student: StudentDto) => {
    setSelectedStudent(student);
    setStudentQuery("");
    setShowStudentDropdown(false);
    const restricted = new Set(student.restrictions.map((r) => r.id));
    setCart((prev) =>
      prev.filter(
        (item) =>
          !products.find((p) => p.id === item.productId)?.tags.some((t) => restricted.has(t.id))
      )
    );
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setStudentQuery("");
  };

  const insufficientBalance =
    selectedStudent?.type === "prepaid" && selectedStudent.balance < total;

  const handleCobrar = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent?.id,
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la venta.");
        return;
      }
      const newBalance = selectedStudent?.type === "prepaid"
        ? (selectedStudent.balance - total)
        : null;
      setConfirmOpen(false);
      setCart([]);
      setSelectedStudent(null);
      setLastSale({
        vendorName: data.sale?.vendorName ?? "Vendedor",
        createdAt: data.sale?.createdAt ?? new Date().toISOString(),
        total: data.sale?.total ?? 0,
        remainingBalance: newBalance,
      });
      setTimeout(() => setLastSale(null), 8000);
    } catch {
      setError("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (studentInputRef.current && !studentInputRef.current.contains(e.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ══ TÍTULO ══ */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <PointOfSaleOutlinedIcon sx={{ fontSize: 24, color: "#0a2540" }} />
        <Typography variant="h5" sx={{ fontWeight: 900, color: "#0a2540" }}>
          Registrar Venta
          
        </Typography>
      </Stack>

      {/* ══ BÚSQUEDA DE ESTUDIANTE + PRODUCTO ══ */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2 }}>
        {/* Estudiante */}
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 1.5 }}>
          Buscar estudiante
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ flex: 1, position: "relative" }} ref={studentInputRef}>
            <TextField
              placeholder="Escribir nombre o apellido..."
              value={studentQuery}
              onChange={(e) => { setStudentQuery(e.target.value); setShowStudentDropdown(true); }}
              onFocus={() => setShowStudentDropdown(true)}
              size="small"
              fullWidth
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "white" } }}
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
            {selectedStudent && (
              <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: "center", flexWrap: "wrap" }}>
                <Chip
                  label={`${selectedStudent.name} — ${selectedStudent.grade}`}
                  onDelete={clearStudent}
                  deleteIcon={<CloseIcon />}
                  sx={{ bgcolor: "#dbeafe", color: "#1d4ed8", fontWeight: 800, fontSize: 13, height: 32, "& .MuiChip-deleteIcon": { color: "#1d4ed8" } }}
                />
                {selectedStudent.restrictions.map((r) => (
                  <Chip key={r.id} label={r.name} size="small"
                    sx={{ bgcolor: "#fee2e2", color: "#dc2626", fontWeight: 700, fontSize: 11 }} />
                ))}
              </Stack>
            )}
            {showStudentDropdown && filteredStudents.length > 0 && (
              <Paper elevation={6} sx={{ position: "absolute", top: 40, left: 0, right: 0, zIndex: 20, borderRadius: 2, overflow: "hidden" }}>
                {filteredStudents.map((s) => (
                  <Box key={s.id} onClick={() => selectStudent(s)}
                    sx={{ px: 2, py: 1.5, cursor: "pointer", "&:hover": { bgcolor: "#f8fafc" }, borderBottom: "1px solid #f1f5f9" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{s.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: s.type === "prepaid" && s.balance < 0 ? "#dc2626" : "#64748b" }}>
                      {s.grade} ·{" "}
                      {s.type === "prepaid"
                        ? s.balance < 0 ? `Deuda: ${formatCurrency(Math.abs(s.balance))}` : formatCurrency(s.balance)
                        : "Pago al cierre"}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
          {selectedStudent && (
            <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start", pt: 0.5, flexShrink: 0 }}>
              <Chip label={selectedStudent.grade} size="small"
                sx={{ bgcolor: "#f1f5f9", color: "#475569", fontWeight: 800, fontSize: 13, height: 30 }} />
              {selectedStudent.type === "prepaid" && (
                <Chip
                  label={selectedStudent.balance < 0
                    ? `Deuda: ${formatCurrency(Math.abs(selectedStudent.balance))}`
                    : formatCurrency(selectedStudent.balance)}
                  size="small"
                  sx={{
                    bgcolor: selectedStudent.balance < 0 ? "#fee2e2" : selectedStudent.balance <= 5000 ? "#fff7ed" : "#dcfce7",
                    color: selectedStudent.balance < 0 ? "#dc2626" : selectedStudent.balance <= 5000 ? "#ea580c" : "#16a34a",
                    fontWeight: 900, fontSize: 13, height: 30,
                  }}
                />
              )}
            </Stack>
          )}
        </Stack>

        {/* Producto + Categoría */}
        <Divider sx={{ mb: 2 }} />
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 1.5 }}>
          Buscar producto
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            placeholder="Buscar producto..."
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            size="small"
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
                endAdornment: productQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setProductQuery("")}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 180 } }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategoryId ?? ""}
              onChange={(e) => setSelectedCategoryId(e.target.value || null)}
              label="Categoría"
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Todas ({products.filter((p) => p.isActive).length})</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name} ({countByCategory[cat.id] ?? 0})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* ══ CUERPO: productos | carrito ══ */}
      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} sx={{ alignItems: { xs: "stretch", lg: "flex-start" } }}>

        {/* ── GRILLA DE PRODUCTOS ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Tarjetas */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: 0.75,
            }}
          >
            {visibleProducts.map((product) => {
              const restricted = isRestricted(product);
              const inCart = cart.find((i) => i.productId === product.id);
              const restrictedTags = product.tags
                .filter((t) => restrictedTagIds.has(t.id))
                .map((t) => t.name)
                .join(", ");

              return (
                <Tooltip
                  key={product.id}
                  title={restricted ? `Restringido: ${restrictedTags}` : ""}
                  placement="top"
                >
                  <Paper
                    elevation={0}
                    onClick={() => addToCart(product)}
                    sx={{
                      p: 1.25,
                      textAlign: "center",
                      cursor: restricted ? "not-allowed" : "pointer",
                      opacity: restricted ? 0.4 : 1,
                      border: restricted ? "2.5px solid" : "1.5px solid",
                      borderColor: restricted ? "#f87171" : inCart ? "#2563eb" : "#e2e8f0",
                      bgcolor: inCart ? "#eff6ff" : "white",
                      borderRadius: 2.5,
                      transition: "all 0.15s",
                      aspectRatio: "1 / 1",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      "&:hover": restricted
                        ? {}
                        : { boxShadow: "0 4px 16px rgba(0,0,0,0.10)", transform: "translateY(-2px)" },
                    }}
                  >
                    <Box sx={{ lineHeight: 1.1, mb: 0.5, display: "flex", justifyContent: "center" }}>
                      <ProductIcon iconId={product.icon} size={28} />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: 13,
                        lineHeight: 1.3,
                        color: "#1e293b",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 900, fontSize: 13, color: "#16a34a" }}>
                      {formatCurrency(product.price)}
                    </Typography>
                    {product.comboItems.length > 0 && (
                      <Stack
                        spacing={0.5}
                        sx={{ mt: 0.75, pt: 0.75, borderTop: "1px solid #f1f5f9" }}
                      >
                        {product.comboItems.map((ci) => (
                          <Stack
                            key={ci.id}
                            direction="row"
                            spacing={0.5}
                            sx={{ alignItems: "center", justifyContent: "center" }}
                          >
                            <ProductIcon iconId={ci.icon} size={13} />
                            <Typography sx={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                              {ci.name}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                    {restricted && (
                      <Chip
                        label="Restringido"
                        size="small"
                        sx={{
                          mt: 0.75,
                          bgcolor: "#fee2e2",
                          color: "#dc2626",
                          fontWeight: 900,
                          height: 20,
                          fontSize: 11,
                        }}
                      />
                    )}
                    {inCart && (
                      <Chip
                        label={`×${inCart.quantity}`}
                        size="small"
                        sx={{
                          mt: 0.75,
                          bgcolor: "#2563eb",
                          color: "white",
                          fontWeight: 900,
                          height: 20,
                          fontSize: 11,
                        }}
                      />
                    )}
                  </Paper>
                </Tooltip>
              );
            })}

            {visibleProducts.length === 0 && (
              <Box sx={{ gridColumn: "1 / -1", textAlign: "center", py: 8, color: "#94a3b8" }}>
                <SearchOffIcon sx={{ fontSize: 48, mb: 1 }} />
                <Typography sx={{ fontWeight: 700 }}>No hay productos para mostrar</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── CARRITO ── */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: "100%", lg: 260 },
            flexShrink: 0,
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            position: { xs: "sticky", lg: "relative" },
            bottom: { xs: 0, lg: "auto" },
            zIndex: { xs: 10, lg: "auto" },
          }}
        >
          {/* Header del carrito */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", px: 2, py: 1.75, borderBottom: "1px solid #f1f5f9" }}
          >
            <ShoppingCartIcon sx={{ color: "#475569", fontSize: 20 }} />
            <Typography sx={{ fontWeight: 900, fontSize: 15, color: "#1e293b" }}>
              Carrito
            </Typography>
          </Stack>

          {/* Resumen post-venta */}
          {lastSale && (
            <Box sx={{ mx: 2, mt: 1.5, p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", mb: 0.75 }}>
                <CheckIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                <Typography sx={{ fontWeight: 900, fontSize: 13, color: "#15803d" }}>
                  ¡Venta registrada!
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 12, color: "#166534" }}>
                {new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(lastSale.createdAt))}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#166534" }}>
                Registrada por: <strong>{lastSale.vendorName}</strong>
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#15803d", mt: 0.5 }}>
                Total: {formatCurrency(lastSale.total)}
              </Typography>
              {lastSale.remainingBalance !== null && (
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: lastSale.remainingBalance < 0 ? "#dc2626" : "#15803d", mt: 0.25 }}>
                  Saldo restante: {formatCurrency(lastSale.remainingBalance)}
                </Typography>
              )}
            </Box>
          )}
          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mx: 2, mt: 1.5, fontSize: 13 }}>
              {error}
            </Alert>
          )}

          {/* Items */}
          {cart.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
              <Typography sx={{ color: "#94a3b8", fontSize: 13, textAlign: "center", lineHeight: 1.8 }}>
                Selecciona productos<br />del catálogo
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
              <Stack spacing={1.5}>
                {cart.map((item) => (
                  <Box key={item.productId}>
                    {/* Nombre + precio + eliminar */}
                    <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1 }}>
                      <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                        <ProductIcon iconId={item.icon} size={20} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.25, color: "#1e293b" }}>
                          {item.name}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                          {formatCurrency(item.price)} c/u
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeFromCart(item.productId)}
                        sx={{
                          width: 22,
                          height: 22,
                          bgcolor: "#fee2e2",
                          color: "#dc2626",
                          flexShrink: 0,
                          "&:hover": { bgcolor: "#fca5a5" },
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Stack>

                    {/* Controles cantidad + subtotal */}
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "space-between", mt: 0.75 }}
                    >
                      <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => changeQty(item.productId, -1)}
                          sx={{ width: 24, height: 24, bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}
                        >
                          <RemoveIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                        <Typography sx={{ fontWeight: 900, fontSize: 13, minWidth: 22, textAlign: "center" }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => changeQty(item.productId, 1)}
                          sx={{ width: 24, height: 24, bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}
                        >
                          <AddIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      </Stack>
                      <Typography sx={{ fontWeight: 900, fontSize: 13, color: "#16a34a" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Stack>

                    {/* Separador */}
                    <Box sx={{ mt: 1.5, height: "1px", bgcolor: "#f1f5f9" }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Footer: total + cobrar */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2.5,
                py: 1.5,
                
                color: "white",
              }}
            >
              <Typography sx={{ fontWeight: 900, fontSize: 15, color: "white" }}>
                Total:
              </Typography>
              <Typography sx={{ fontWeight: 900, fontSize: 18, color: "white" }}>
                {formatCurrency(total)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              fullWidth
              disabled={cart.length === 0 || submitting}
              onClick={() => setConfirmOpen(true)}
              sx={{
                bgcolor: "#22c55e",
                "&:hover": { bgcolor: "#16a34a" },
                "&:disabled": { bgcolor: "#86efac", color: "white" },
                fontWeight: 900,
                fontSize: 15,
                py: 1.5,
                borderRadius: 0,
                boxShadow: "none",
              }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <><CheckIcon sx={{ fontSize: 18, mr: 0.75 }} />Cobrar</>

              )}
            </Button>
          </Box>
        </Paper>
      </Stack>
    </Box>

    {/* ══ MODAL DE CONFIRMACIÓN ══ */}
    <Dialog open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 900, fontSize: 18, pb: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CheckIcon sx={{ color: "#16a34a", fontSize: 22 }} />
          <span>Confirmar Venta</span>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: "8px !important" }}>
        {selectedStudent && (
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#0a2540", mb: 2 }}>
            {selectedStudent.name} — {selectedStudent.grade}
          </Typography>
        )}

        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#f8fafc" }}>
              <TableCell sx={{ fontWeight: 900, fontSize: 11, color: "#64748b" }}>PRODUCTO</TableCell>
              <TableCell align="center" sx={{ fontWeight: 900, fontSize: 11, color: "#64748b" }}>CANT</TableCell>
              <TableCell align="right" sx={{ fontWeight: 900, fontSize: 11, color: "#64748b" }}>SUBTOTAL</TableCell>
              <TableCell sx={{ width: 32 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {cart.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <ProductIcon iconId={item.icon} size={16} />
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                    <IconButton size="small"
                      onClick={() => changeQty(item.productId, -1)}
                      sx={{ width: 22, height: 22, bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}
                    >
                      <RemoveIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                    <Typography sx={{ fontWeight: 900, fontSize: 13, minWidth: 20, textAlign: "center" }}>
                      {item.quantity}
                    </Typography>
                    <IconButton size="small"
                      onClick={() => changeQty(item.productId, 1)}
                      sx={{ width: 22, height: 22, bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#e2e8f0" } }}
                    >
                      <AddIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small"
                    onClick={() => removeFromCart(item.productId)}
                    sx={{ color: "#e74c3c", "&:hover": { bgcolor: "#fde1dd" } }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 0 }} />

        <Box sx={{ bgcolor: "#0a2540", borderRadius: "0 0 4px 4px", px: 2, py: 1.25, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 900, fontSize: 13, color: "white" }}>TOTAL</Typography>
          <Typography sx={{ fontWeight: 900, fontSize: 18, color: "white" }}>{formatCurrency(total)}</Typography>
        </Box>

        {insufficientBalance && !error && (
          <Alert severity="warning" sx={{ mt: 1.5, fontSize: 13 }}>
            Saldo insuficiente. Disponible: {formatCurrency(selectedStudent!.balance)}. El estudiante quedará con deuda de {formatCurrency(total - selectedStudent!.balance)}.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setError(null)}>{error}</Alert>}

        <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: "flex-end" }}>
          <Button variant="contained" color="inherit" onClick={() => setConfirmOpen(false)} disabled={submitting} sx={{ fontWeight: 700 }}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={cart.length === 0 || submitting}
            onClick={handleCobrar}
            sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" }, fontWeight: 900 }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Confirmar"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
    </>
  );
}
