import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  productCount: number;
};

export type CreateCategoryInput = {
  name: string;
  icon?: string | null;
};

export type UpdateCategoryInput = {
  name?: string;
  icon?: string | null;
};

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  icon: true,
  _count: { select: { products: true } },
} satisfies Prisma.CategorySelect;

type CategoryRow = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

function toDto(row: CategoryRow): CategoryDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    productCount: row._count.products,
  };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function listCategoriesWithCount(): Promise<CategoryDto[]> {
  const rows = await prisma.category.findMany({
    select: categorySelect,
    orderBy: { name: "asc" },
  });
  return rows.map(toDto);
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDto> {
  const slug = toSlug(input.name);
  const row = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug,
      icon: input.icon?.trim() || null,
    },
    select: categorySelect,
  });
  return toDto(row);
}

export async function updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryDto> {
  const row = await prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name.trim() }),
      ...(input.icon !== undefined && { icon: input.icon?.trim() || null }),
    },
    select: categorySelect,
  });
  return toDto(row);
}

export async function deleteCategory(id: string): Promise<void> {
  const row = await prisma.category.findUnique({
    where: { id },
    select: { _count: { select: { products: true } } },
  });
  if (!row) throw new Error("Categoría no encontrada.");
  if (row._count.products > 0) {
    throw new Error(
      `No se puede eliminar: tiene ${row._count.products} producto(s) asignado(s).`
    );
  }
  await prisma.category.delete({ where: { id } });
}
