"use client";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LabelOutlinedIcon from "@mui/icons-material/LabelOutlined";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import type { TagDto } from "../schemas/tag.schema";

type TagDrawerProps = {
  open: boolean;
  tags: TagDto[];
  onClose: () => void;
  onTagCreated: (tag: TagDto) => void;
  onTagDeleted: (tagId: string) => void;
};

export function TagDrawer({
  open,
  tags,
  onClose,
  onTagCreated,
  onTagDeleted,
}: TagDrawerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newTagName.trim();
    if (!name) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la etiqueta.");
        return;
      }

      onTagCreated(data as TagDto);
      setNewTagName("");
    } catch {
      setError("Error de conexión.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (tag: TagDto) => {
    setDeletingId(tag.id);
    setError(null);

    try {
      const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo eliminar la etiqueta.");
        return;
      }

      onTagDeleted(tag.id);
    } catch {
      setError("Error de conexión.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 340, p: 3 } } }}
    >
      {/* ── Cabecera ── */}
      <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
        <LabelOutlinedIcon sx={{ color: "#0a2540", mr: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 900, flex: 1, color: "#0a2540" }}>
          Etiquetas
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
        Las etiquetas se asignan a productos y se usan para restringir lo que
        puede consumir un estudiante.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Crear etiqueta ── */}
      <TextField
        label="Nueva etiqueta"
        placeholder="Ej: bebida azucarada"
        value={newTagName}
        onChange={(e) => setNewTagName(e.target.value)}
        onKeyDown={handleKeyDown}
        fullWidth
        disabled={creating}
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleCreate}
                  disabled={creating || !newTagName.trim()}
                  size="small"
                  sx={{
                    bgcolor: "secondary.main",
                    color: "white",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "secondary.dark" },
                    "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#9e9e9e" },
                  }}
                >
                  {creating ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AddIcon fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1.5 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Divider sx={{ mb: 2.5 }} />

      {/* ── Lista de etiquetas ── */}
      {tags.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            color: "text.secondary",
          }}
        >
          <LabelOutlinedIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
          <Typography sx={{ fontSize: 13 }}>
            No hay etiquetas todavía.
            <br />
            Crea la primera arriba.
          </Typography>
        </Box>
      ) : (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {tags.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onDelete={() => handleDelete(tag)}
              deleteIcon={
                deletingId === tag.id ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <DeleteOutlineIcon />
                )
              }
              disabled={deletingId === tag.id}
              sx={{
                bgcolor: "#fde1dd",
                color: "#bf1f14",
                fontWeight: 800,
                fontSize: 13,
                "& .MuiChip-deleteIcon": {
                  color: "#bf1f14",
                  "&:hover": { color: "#8b0000" },
                },
              }}
            />
          ))}
        </Stack>
      )}
    </Drawer>
  );
}
