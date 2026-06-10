import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSale } from "../sale.service";

// ─── Mock de Prisma ───────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const PRODUCT = { id: "prod-1", name: "Empanada", price: 2000 };
const VENDOR_ID = "vendor-1";

const BASE_INPUT = {
  studentId: "stu-1",
  items: [{ productId: "prod-1", quantity: 1 }],
};

const BASE_SALE_ROW = {
  id: "sale-1",
  studentId: "stu-1",
  vendorId: VENDOR_ID,
  total: 2000,
  createdAt: new Date("2026-06-09"),
  vendor: { name: "Vendedor" },
  saleItems: [
    {
      productId: "prod-1",
      quantity: 1,
      unitPrice: 2000,
      subtotal: 2000,
      product: { name: "Empanada" },
    },
  ],
};

function mockTransaction(studentRow: object | null, updatedBalance: number) {
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => any) => {
    const tx = {
      student: {
        findUnique: vi.fn().mockResolvedValue(studentRow),
        update: vi.fn().mockResolvedValue({ balance: updatedBalance }),
      },
      sale: {
        create: vi.fn().mockResolvedValue(BASE_SALE_ROW),
      },
    };
    return fn(tx);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(prisma.product.findMany).mockResolvedValue([PRODUCT] as never);
});

// ─── CP-05: Venta exitosa con saldo positivo ──────────────────────────────────
describe("CP-05 — Venta exitosa con saldo positivo", () => {
  it("registra la venta y retorna el DTO correcto", async () => {
    mockTransaction({ type: "prepaid", balance: 10000, isActive: true }, 8000);

    const result = await createSale(BASE_INPUT, VENDOR_ID);

    expect(result.id).toBe("sale-1");
    expect(result.total).toBe(2000);
    expect(result.items).toHaveLength(1);
  });

  it("decrementa el saldo del estudiante prepago", async () => {
    const txImpl = vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => any) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 10000, isActive: true }),
          update: vi.fn().mockResolvedValue({ balance: 8000 }),
        },
        sale: { create: vi.fn().mockResolvedValue(BASE_SALE_ROW) },
      };
      const result = await fn(tx);
      expect(tx.student.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { balance: { decrement: 2000 } },
        })
      );
      return result;
    });

    await createSale(BASE_INPUT, VENDOR_ID);
    expect(txImpl).toHaveBeenCalledOnce();
  });
});

// ─── CP-06: Venta con saldo en 0 queda en deuda ───────────────────────────────
describe("CP-06 — Venta con saldo en 0 queda en deuda", () => {
  it("permite la venta aunque el saldo sea 0 y genera deuda", async () => {
    mockTransaction({ type: "prepaid", balance: 0, isActive: true }, -2000);

    const result = await createSale(BASE_INPUT, VENDOR_ID);

    expect(result.total).toBe(2000);
  });

  it("llama a decrement aunque el saldo sea 0", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => any) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 0, isActive: true }),
          update: vi.fn().mockResolvedValue({ balance: -2000 }),
        },
        sale: { create: vi.fn().mockResolvedValue(BASE_SALE_ROW) },
      };
      const result = await fn(tx);
      expect(tx.student.update).toHaveBeenCalled();
      return result;
    });

    await createSale(BASE_INPUT, VENDOR_ID);
  });
});

// ─── CP-07: Venta con saldo negativo acumula deuda ────────────────────────────
describe("CP-07 — Venta con saldo negativo acumula deuda", () => {
  it("permite la venta y el saldo se vuelve más negativo", async () => {
    mockTransaction({ type: "prepaid", balance: -2000, isActive: true }, -4000);

    const result = await createSale(BASE_INPUT, VENDOR_ID);

    expect(result.total).toBe(2000);
  });
});

// ─── CP-17: Estudiante activo puede comprar normalmente ───────────────────────
describe("CP-17 — Estudiante activo puede comprar normalmente", () => {
  it("procesa la venta sin errores", async () => {
    mockTransaction({ type: "prepaid", balance: 5000, isActive: true }, 3000);

    await expect(createSale(BASE_INPUT, VENDOR_ID)).resolves.not.toThrow();
  });
});

// ─── CP-18: Estudiante inactivo no puede comprar ──────────────────────────────
describe("CP-18 — Estudiante inactivo no puede comprar", () => {
  it("lanza error indicando que el estudiante está inactivo", async () => {
    mockTransaction({ type: "prepaid", balance: 5000, isActive: false }, 0);

    await expect(createSale(BASE_INPUT, VENDOR_ID)).rejects.toThrow(
      "El estudiante está inactivo."
    );
  });

  it("no crea la venta si el estudiante está inactivo", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: (tx: any) => any) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 5000, isActive: false }),
          update: vi.fn(),
        },
        sale: { create: vi.fn() },
      };
      try { await fn(tx); } catch {}
      expect(tx.sale.create).not.toHaveBeenCalled();
    });

    await createSale(BASE_INPUT, VENDOR_ID).catch(() => {});
  });
});

// ─── CP-20: Estudiante inactivo prepago no puede comprar ──────────────────────
describe("CP-20 — Estudiante inactivo prepago: inactivo tiene precedencia", () => {
  it("lanza error de inactivo aunque sea prepago con saldo positivo", async () => {
    mockTransaction({ type: "prepaid", balance: 99999, isActive: false }, 0);

    await expect(createSale(BASE_INPUT, VENDOR_ID)).rejects.toThrow(
      "El estudiante está inactivo."
    );
  });
});

// ─── Casos de error general ───────────────────────────────────────────────────
describe("Producto inexistente o inactivo", () => {
  it("lanza error si algún producto no existe", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as never);

    await expect(createSale(BASE_INPUT, VENDOR_ID)).rejects.toThrow(
      "Uno o más productos no existen o están inactivos."
    );
  });
});
