import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProduct, deleteProduct, updateProduct } from "../product.service";

// Mock de Prisma — se reemplaza el módulo completo antes de importar el servicio
vi.mock("@/lib/prisma", () => ({
    prisma: {
        product: {
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";

// Fixture base que satisface la forma de ProductWithCounts
function makeProductRow(overrides: Record<string, unknown> = {}) {
    return {
        id: "prod-1",
        name: "Agua",
        price: 1500,
        categoryId: null,
        category: null,
        icon: null,
        isActive: true,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        _count: { saleItems: 0 },
        comboItems: [],
        tags: [],
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createProduct ───────────────────────────────────────────────────────────

describe("createProduct", () => {
    it("crea el producto y retorna el DTO correcto", async () => {
        const row = makeProductRow();
        vi.mocked(prisma.product.create).mockResolvedValue(row as never);

        const result = await createProduct({
            name: "Agua",
            price: 1500,
            isActive: true,
            comboItemIds: [],
            tagIds: [],
            });

        expect(prisma.product.create).toHaveBeenCalledOnce();
        expect(result.name).toBe("Agua");
        expect(result.price).toBe(1500);
        expect(result.saleCount).toBe(0);
    });

    it("redondea el precio al entero más cercano", async () => {
        const row = makeProductRow({ price: 1500 });
        vi.mocked(prisma.product.create).mockResolvedValue(row as never);

        await createProduct({
            name: "Agua",
            price: 1499.7, // debe redondearse a 1500
            isActive: true,
            comboItemIds: [],
            tagIds: [],
            });

        const callArg = vi.mocked(prisma.product.create).mock.calls[0][0];
        expect(callArg.data.price).toBe(1500);
    });

    it("normaliza campos opcionales vacíos a null", async () => {
        const row = makeProductRow({ icon: null, categoryId: null });
        vi.mocked(prisma.product.create).mockResolvedValue(row as never);

        await createProduct({
            name: "Agua",
            price: 1500,
            icon: "   ", // solo espacios → debe normalizarse a null
            categoryId: "",
            isActive: true,
            comboItemIds: [],
            tagIds: [],
            });

        const callArg = vi.mocked(prisma.product.create).mock.calls[0][0];
        expect(callArg.data.icon).toBeNull();
        expect(callArg.data.categoryId).toBeNull();
    });
});

// ─── updateProduct ───────────────────────────────────────────────────────────

describe("updateProduct", () => {
    it("solo envía a Prisma los campos definidos en el input", async () => {
        const row = makeProductRow({ name: "Agua fría", price: 1800 });
        vi.mocked(prisma.product.update).mockResolvedValue(row as never);

        await updateProduct("prod-1", { name: "Agua fría", price: 1800 });

        const callArg = vi.mocked(prisma.product.update).mock.calls[0][0];
        expect(callArg.data).toMatchObject({ name: "Agua fría", price: 1800 });
        // isActive no se incluyó en el input — no debe estar en el data
        expect(callArg.data.isActive).toBeUndefined();
    });

    it("retorna el DTO actualizado", async () => {
        const row = makeProductRow({ name: "Agua fría", isActive: false });
        vi.mocked(prisma.product.update).mockResolvedValue(row as never);

        const result = await updateProduct("prod-1", { isActive: false });
        expect(result.isActive).toBe(false);
    });
});

// ─── deleteProduct ───────────────────────────────────────────────────────────

describe("deleteProduct", () => {
    it("elimina el producto si no tiene ventas asociadas", async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(
            { _count: { saleItems: 0 } } as never
        );
        vi.mocked(prisma.product.delete).mockResolvedValue({} as never);

        await deleteProduct("prod-1");

        expect(prisma.product.delete).toHaveBeenCalledWith({
            where: { id: "prod-1" },
        });
    });

    it("lanza error si el producto tiene ventas", async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(
            { _count: { saleItems: 3 } } as never
        );

        await expect(deleteProduct("prod-1")).rejects.toThrow(
            "No se puede eliminar un producto que tiene ventas"
        );
        expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it("lanza error si el producto no existe", async () => {
        vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

        await expect(deleteProduct("prod-inexistente")).rejects.toThrow(
            "Producto no encontrado"
        );
        expect(prisma.product.delete).not.toHaveBeenCalled();
    });
});
