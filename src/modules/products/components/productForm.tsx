"use client";

import NoFoodOutlinedIcon from "@mui/icons-material/NoFoodOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState, useCallback, useMemo } from "react";

import { formatCurrency } from "@/lib/currency";
import {
  getProductIconOption,
  getProductIconOptionsByCategory,
} from "../constants/product-icons";
import type {
  ProductCategoryDto,
  ProductDto,
  ProductFormValues,
  ProductTagDto,
} from "../schemas/product.schema";

type Props = {
  mode: "create" | "edit";
  categories: ProductCategoryDto[];
  products: ProductDto[];
  product?: ProductDto | null;
  onClose: () => void;
  onSuccess: (product: ProductDto) => void;
};

function getDefaultValues(product?: ProductDto | null): ProductFormValues {
  return {
    name: product?.name ?? "",
    price: product?.price ?? 0,
    categoryId: product?.categoryId ?? "",
    icon: product?.icon ?? "",
    isActive: product?.isActive ?? true,
    comboItemIds: product?.comboItems.map((ci) => ci.id) ?? [],
    tagIds: product?.tags.map((t) => t.id) ?? [],
  };
}

export default function ProductForm({
  mode,
  categories,
  products,
  product,
  onClose,
  onSuccess,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<ProductTagDto[]>([]);

  // Cargar etiquetas al montar (crear y editar)
  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data: ProductTagDto[]) => setAvailableTags(data))
      .catch(() => {});
  }, []);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProductFormValues>({
    defaultValues: getDefaultValues(product),
  });

  useEffect(() => {
    reset(getDefaultValues(product));
  }, [product, reset]);

  const selectedCategoryId = useWatch({ control, name: "categoryId" });
  const selectedIcon = useWatch({ control, name: "icon" });
  const selectedComboItemIds = useWatch({ control, name: "comboItemIds" }) ?? [];
  const rawTagIds = useWatch({ control, name: "tagIds" });
  const selectedTagIds = useMemo(() => rawTagIds ?? [], [rawTagIds]);

  const toggleTag = useCallback((tagId: string, active: boolean) => {
    const next = active
      ? [...selectedTagIds, tagId]
      : selectedTagIds.filter((id) => id !== tagId);
    setValue("tagIds", next);
  }, [selectedTagIds, setValue]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategorySlug = selectedCategory?.slug ?? "";
  const suggestedIcons = getProductIconOptionsByCategory(selectedCategorySlug);
  const isCombo = selectedCategorySlug === "combos";

  const nonComboProducts = products.filter(
    (p) => p.category?.slug !== "combos" && p.id !== product?.id && p.isActive
  );

  const comboItem1 = nonComboProducts.find((p) => p.id === selectedComboItemIds[0]);
  const comboItem2 = nonComboProducts.find((p) => p.id === selectedComboItemIds[1]);

  useEffect(() => {
    if (!isCombo) {
      setValue("comboItemIds", []);
      return;
    }
    const price = (comboItem1?.price ?? 0) + (comboItem2?.price ?? 0);
    setValue("price", price);
  }, [isCombo, comboItem1, comboItem2, setValue]);

  useEffect(() => {
    if (!selectedCategorySlug || !selectedIcon) return;
    const iconIsValidForCategory = suggestedIcons.some((o) => o.id === selectedIcon);
    if (!iconIsValidForCategory) setValue("icon", "");
  }, [selectedCategorySlug, selectedIcon, suggestedIcons, setValue]);

  async function onSubmit(values: ProductFormValues) {
    setError(null);
    setIsLoading(true);

    try {
      const url = mode === "create" ? "/api/products" : `/api/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el producto.");
        return;
      }

      onSuccess(data.product);
      onClose();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3} sx={{ mt: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Nombre"
          placeholder="Ej: Papas fritas"
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message}
          fullWidth
          disabled={isLoading}
        />

        <TextField
          label="Precio"
          type="number"
          {...register("price", { valueAsNumber: true })}
          error={!!errors.price}
          helperText={
            isCombo && comboItem1 && comboItem2
              ? `Precio individual: ${formatCurrency(comboItem1.price + comboItem2.price)} — ajusta el precio del combo aquí`
              : errors.price?.message
          }
          slotProps={{ htmlInput: { min: 0, step: 100 } }}
          fullWidth
          disabled={isLoading}
        />

        {isCombo && (
          <>
            <Controller
              name="comboItemIds"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Producto 1 del combo"
                  select
                  value={field.value?.[0] ?? ""}
                  onChange={(e) => {
                    const updated = [...(field.value ?? [])];
                    updated[0] = e.target.value;
                    field.onChange(updated.filter(Boolean));
                  }}
                  onBlur={field.onBlur}
                  fullWidth
                  disabled={isLoading}
                >
                  <MenuItem value="">Selecciona un producto</MenuItem>
                  {nonComboProducts.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="comboItemIds"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Producto 2 del combo"
                  select
                  value={field.value?.[1] ?? ""}
                  onChange={(e) => {
                    const updated = [...(field.value ?? [])];
                    updated[1] = e.target.value;
                    field.onChange(updated.filter(Boolean));
                  }}
                  onBlur={field.onBlur}
                  fullWidth
                  disabled={isLoading}
                >
                  <MenuItem value="">Selecciona un producto</MenuItem>
                  {nonComboProducts
                    .filter((p) => p.id !== selectedComboItemIds[0])
                    .map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.price)}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </>
        )}

        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <TextField
              label="Tipo de producto"
              select
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              name={field.name}
              inputRef={field.ref}
              error={!!errors.categoryId}
              helperText={errors.categoryId?.message}
              fullWidth
              disabled={isLoading}
            >
              <MenuItem value="">Sin categoría</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {!isCombo && (
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <Box>
                <Stack direction="row" sx={{ alignItems: "center", mb: 1.25 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Ícono</Typography>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                  <Chip
                    label={<NoFoodOutlinedIcon fontSize="small" />}
                    aria-label="Sin ícono"
                    clickable={!isLoading}
                    onClick={() => field.onChange("")}
                    variant={!field.value ? "filled" : "outlined"}
                    color={!field.value ? "primary" : "default"}
                    sx={{ minWidth: 44 }}
                  />
                  {suggestedIcons.map((option) => {
                    const selected = field.value === option.id;
                    const Icon = option.Icon;
                    return (
                      <Chip
                        key={option.id}
                        label={<Icon fontSize="small" />}
                        aria-label={option.label}
                        clickable={!isLoading}
                        onClick={() => field.onChange(option.id)}
                        variant={selected ? "filled" : "outlined"}
                        color={selected ? "primary" : "default"}
                        sx={{ minWidth: 44 }}
                      />
                    );
                  })}
                </Stack>
                {field.value && (
                  <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 1 }}>
                    {getProductIconOption(field.value)?.label ?? "Ícono personalizado"}
                  </Typography>
                )}
                {errors.icon?.message && (
                  <Typography sx={{ color: "error.main", fontSize: 12, mt: 1 }}>
                    {errors.icon.message}
                  </Typography>
                )}
              </Box>
            )}
          />
        )}

        {/* Etiquetas de restricción */}
        {availableTags.length > 0 && (
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b", mb: 1 }}>
              ETIQUETAS DE RESTRICCIÓN
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
              {availableTags.map((tag) => {
                const active = selectedTagIds.includes(tag.id);
                return (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    clickable={!isLoading}
                    onClick={() => toggleTag(tag.id, !active)}
                    variant={active ? "filled" : "outlined"}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      ...(active && {
                        bgcolor: "#fee2e2",
                        color: "#dc2626",
                        borderColor: "#fca5a5",
                      }),
                    }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(field.value)}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={isLoading}
                />
              }
              label="Producto activo"
            />
          )}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
        >
          {isLoading
            ? "Guardando..."
            : mode === "create"
              ? "Guardar Producto"
              : "Guardar Cambios"}
        </Button>
      </Stack>
    </form>
  );
}
