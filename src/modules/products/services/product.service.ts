import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  CreateProductInput,
  ProductCategoryDto,
  ProductComboItemDto,
  ProductDto,
  UpdateProductInput,
} from "../schemas/product.schema";

const comboItemSelect = {
  id: true,
  item: {
    select: {
      id: true,
      name: true,
      price: true,
      icon: true,
    },
  },
} satisfies Prisma.ComboItemSelect;

const productSelect = {
  id: true,
  name: true,
  price: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
    },
  },
  icon: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      saleItems: true,
    },
  },
  comboItems: {
    select: comboItemSelect,
  },
  tags: {
    select: {
      tag: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.ProductSelect;

type ProductWithCounts = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  icon: true,
} satisfies Prisma.CategorySelect;

type CategoryRow = Prisma.CategoryGetPayload<{
  select: typeof categorySelect;
}>;

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toCategoryDto(category: CategoryRow): ProductCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
  };
}

function toComboItemDto(
  ci: Prisma.ComboItemGetPayload<{ select: typeof comboItemSelect }>
): ProductComboItemDto {
  return {
    id: ci.item.id,
    name: ci.item.name,
    price: ci.item.price,
    icon: ci.item.icon,
  };
}

function toProductDto(product: ProductWithCounts): ProductDto {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    categoryId: product.categoryId,
    category: product.category ? toCategoryDto(product.category) : null,
    icon: product.icon,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    saleCount: product._count.saleItems,
    comboItems: product.comboItems.map(toComboItemDto),
    tags: product.tags.map((pt) => ({ id: pt.tag.id, name: pt.tag.name })),
  };
}

export async function listProducts() {
  const products = await prisma.product.findMany({
    select: productSelect,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });

  return products.map(toProductDto);
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });

  return categories.map(toCategoryDto);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: productSelect,
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  return toProductDto(product);
}

export async function createProduct(input: CreateProductInput) {
  const validComboItemIds = (input.comboItemIds ?? []).filter(Boolean);
  const validTagIds = (input.tagIds ?? []).filter(Boolean);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      price: Math.round(input.price),
      categoryId: normalizeOptionalText(input.categoryId),
      icon: normalizeOptionalText(input.icon),
      isActive: input.isActive,
      comboItems: validComboItemIds.length > 0
        ? { create: validComboItemIds.map((itemId) => ({ itemId })) }
        : undefined,
      tags: validTagIds.length > 0
        ? { create: validTagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    select: productSelect,
  });

  return toProductDto(product);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.price !== undefined && { price: Math.round(input.price) }),
      ...(input.categoryId !== undefined && {
        categoryId: normalizeOptionalText(input.categoryId),
      }),
      ...(input.icon !== undefined && { icon: normalizeOptionalText(input.icon) }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      ...(input.comboItemIds !== undefined && {
        comboItems: {
          deleteMany: {},
          create: input.comboItemIds.filter(Boolean).map((itemId) => ({ itemId })),
        },
      }),
      ...(input.tagIds !== undefined && {
        tags: {
          deleteMany: {},
          create: input.tagIds.filter(Boolean).map((tagId) => ({ tagId })),
        },
      }),
    },
    select: productSelect,
  });

  return toProductDto(product);
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { _count: { select: { saleItems: true } } },
  });

  if (!product) {
    throw new Error("Producto no encontrado");
  }

  if (product._count.saleItems > 0) {
    throw new Error(
      "No se puede eliminar un producto que tiene ventas. Desactívalo en su lugar."
    );
  }

  await prisma.product.delete({
    where: { id },
  });
}

