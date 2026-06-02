"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import type { CategoryDto } from "@/modules/products/services/category.service";
import type { TagDto } from "@/modules/tags/schemas/tag.schema";
import { CategoryIconDisplay } from "../utils/category-icons";
import { IconPicker } from "./icon-picker";

type Props = {
  initialCategories: CategoryDto[];
  initialTags: TagDto[];
};

export function CatalogManager({ initialCategories, initialTags }: Props) {
  const [categories, setCategories] = useState<CategoryDto[]>(initialCategories);
  const [tags, setTags] = useState<TagDto[]>(initialTags);

  // ── Create form ──
  const [catName, setCatName] = useState("");
  const [catIcon, setCatIcon] = useState<string | null>(null);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // ── Edit form ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Tags ──
  const [tagName, setTagName] = useState("");
  const [tagLoading, setTagLoading] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // ── Category CRUD ──
  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    setCatLoading(true);
    setCatError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: catName.trim(), icon: catIcon }),
      });
      const data = await res.json();
      if (!res.ok) { setCatError(data.error); return; }
      setCategories((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setCatName("");
      setCatIcon(null);
    } catch {
      setCatError("Error de conexión.");
    } finally {
      setCatLoading(false);
    }
  };

  const startEdit = (cat: CategoryDto) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim(), icon: editIcon }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error); return; }
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch {
      setEditError("Error de conexión.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { alert(data.error); return; }
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Error de conexión.");
    }
  };

  // ── Tag CRUD ──
  const handleCreateTag = async () => {
    if (!tagName.trim()) return;
    setTagLoading(true);
    setTagError(null);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setTagError(data.error ?? "Error al crear etiqueta."); return; }
      setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setTagName("");
    } catch {
      setTagError("Error de conexión.");
    } finally {
      setTagLoading(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/tags/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "No se pudo eliminar.");
        return;
      }
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert("Error de conexión.");
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#0a2540" }}>
          Catálogo y Etiquetas
        </Typography>
        <Typography sx={{ fontSize: 24 }}>
          
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={3} sx={{ alignItems: "flex-start" }}>

        {/* ══════ CATEGORÍAS ══════ */}
        <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0a2540" }}>
              Categorías de Producto
            </Typography>
            <Chip label={categories.length} size="small"
              sx={{ bgcolor: "#e2e8f0", fontWeight: 900, fontSize: 12 }} />
          </Stack>
          <Typography sx={{ fontSize: 13, color: "#64748b", mb: 2.5 }}>
            Organiza tu catálogo. Elige un ícono haciendo clic en él.
          </Typography>

          <Stack spacing={0} sx={{ mb: 3 }}>
            {categories.map((cat, idx) => (
              <Box key={cat.id}>
                {idx > 0 && <Divider />}

                {editingId === cat.id ? (
                  <Box sx={{ py: 1.5 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                      <IconPicker value={editIcon} onChange={setEditIcon} />
                      <TextField
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nombre"
                        size="small"
                        fullWidth
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(cat.id)}
                      />
                    </Stack>
                    {editError && (
                      <Alert severity="error" sx={{ fontSize: 12, mb: 1 }}>{editError}</Alert>
                    )}
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={editLoading || !editName.trim()}
                        onClick={() => handleSaveEdit(cat.id)}
                        sx={{ bgcolor: "#0a2540", fontWeight: 800, "&:hover": { bgcolor: "#0d2f55" } }}
                      >
                        {editLoading ? <CircularProgress size={14} color="inherit" /> : "Guardar"}
                      </Button>
                      <Button size="small" onClick={cancelEdit} sx={{ color: "#64748b" }}>
                        Cancelar
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Stack direction="row" sx={{ alignItems: "center", py: 1.5, gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: 2,
                        bgcolor: "#f1f5f9", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <CategoryIconDisplay iconKey={cat.icon} sx={{ fontSize: 20, color: "#475569" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                        {cat.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                        {cat.productCount} producto{cat.productCount !== 1 ? "s" : ""}
                      </Typography>
                    </Box>
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => startEdit(cat)} sx={{ color: "#64748b" }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={cat.productCount > 0
                        ? `Tiene ${cat.productCount} producto(s) — muévelos primero`
                        : "Eliminar"}
                    >
                      <span>
                        <IconButton
                          size="small"
                          disabled={cat.productCount > 0}
                          onClick={() => handleDeleteCategory(cat.id)}
                          sx={{ color: "#dc2626", "&:disabled": { color: "#cbd5e1" } }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                )}
              </Box>
            ))}
            {categories.length === 0 && (
              <Typography sx={{ color: "#94a3b8", fontSize: 13, py: 2 }}>
                No hay categorías. Crea la primera abajo.
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#475569", mb: 1.5 }}>
            Nueva categoría
          </Typography>
          {catError && (
            <Alert severity="error" onClose={() => setCatError(null)} sx={{ mb: 1.5, fontSize: 13 }}>
              {catError}
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <IconPicker value={catIcon} onChange={setCatIcon} />
            <TextField
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Ej: Bebidas"
              size="small"
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
            />
            <Button
              variant="contained"
              disabled={catLoading || !catName.trim()}
              onClick={handleCreateCategory}
              startIcon={catLoading ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              sx={{
                bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" },
                fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Agregar
            </Button>
          </Stack>
        </Paper>

        {/* ══════ ETIQUETAS ══════ */}
        <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0a2540" }}>
              Etiquetas de Restricción
            </Typography>
            <Chip label={tags.length} size="small"
              sx={{ bgcolor: "#e2e8f0", fontWeight: 900, fontSize: 12 }} />
          </Stack>
          <Typography sx={{ fontSize: 13, color: "#64748b", mb: 2.5 }}>
            Se asignan a productos y estudiantes para controlar qué pueden comprar.
          </Typography>

          <Stack spacing={0} sx={{ mb: 3 }}>
            {tags.map((tag, idx) => (
              <Box key={tag.id}>
                {idx > 0 && <Divider />}
                <Stack direction="row" sx={{ alignItems: "center", py: 1.5, gap: 1.5 }}>
                  <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                    {tag.name}
                  </Typography>
                  <Tooltip title="Eliminar etiqueta">
                    <IconButton size="small" onClick={() => handleDeleteTag(tag.id)}
                      sx={{ color: "#dc2626" }}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
            {tags.length === 0 && (
              <Typography sx={{ color: "#94a3b8", fontSize: 13, py: 2 }}>
                No hay etiquetas. Crea la primera abajo.
              </Typography>
            )}
          </Stack>

          <Divider sx={{ mb: 2.5 }} />

          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#475569", mb: 1.5 }}>
            Nueva etiqueta
          </Typography>
          {tagError && (
            <Alert severity="error" onClose={() => setTagError(null)} sx={{ mb: 1.5, fontSize: 13 }}>
              {tagError}
            </Alert>
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Ej: gluten, dulces, lácteos..."
              size="small"
              fullWidth
              onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            />
            <Button
              variant="contained"
              disabled={tagLoading || !tagName.trim()}
              onClick={handleCreateTag}
              startIcon={tagLoading ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              sx={{
                bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" },
                fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0,
              }}
            >
              Agregar
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
