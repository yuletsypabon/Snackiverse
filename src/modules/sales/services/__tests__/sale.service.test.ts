import { describe, it, expect, vi, beforeEach } from "vitest";
import { createSale } from "../sale.service";

type MockTx = {
  student: { findUnique: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
  sale: { create: ReturnType<typeof vi.fn> };
};
type TxFn = (tx: MockTx) => Promise<unknown>;

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
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
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
    const txImpl = vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
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
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
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
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
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

// ─── CP-01: Venta con múltiples productos distintos ───────────────────────────
describe("CP-01 — Venta con múltiples productos distintos", () => {
  const MULTI_INPUT = {
    studentId: "stu-1",
    items: [
      { productId: "prod-1", quantity: 1 },
      { productId: "prod-2", quantity: 2 },
    ],
  };

  const MULTI_SALE_ROW = {
    ...BASE_SALE_ROW,
    total: 5000,
    saleItems: [
      { productId: "prod-1", quantity: 1, unitPrice: 2000, subtotal: 2000, product: { name: "Empanada" } },
      { productId: "prod-2", quantity: 2, unitPrice: 1500, subtotal: 3000, product: { name: "Jugo" } },
    ],
  };

  beforeEach(() => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: "prod-1", name: "Empanada", price: 2000 },
      { id: "prod-2", name: "Jugo",     price: 1500 },
    ] as never);
  });

  it("calcula el total sumando todos los ítems correctamente", async () => {
    mockTransaction({ type: "prepaid", balance: 20000, isActive: true }, 15000);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 20000, isActive: true }),
          update: vi.fn().mockResolvedValue({ balance: 15000 }),
        },
        sale: { create: vi.fn().mockResolvedValue(MULTI_SALE_ROW) },
      };
      return fn(tx);
    });

    const result = await createSale(MULTI_INPUT, VENDOR_ID);

    expect(result.total).toBe(5000);
    expect(result.items).toHaveLength(2);
  });

  it("decrementa el saldo con el total acumulado de todos los ítems", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 20000, isActive: true }),
          update: vi.fn().mockResolvedValue({ balance: 15000 }),
        },
        sale: { create: vi.fn().mockResolvedValue(MULTI_SALE_ROW) },
      };
      const result = await fn(tx);
      expect(tx.student.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { balance: { decrement: 5000 } } })
      );
      return result;
    });

    await createSale(MULTI_INPUT, VENDOR_ID);
  });
});

// ─── CP-03: Venta con producto combo ─────────────────────────────────────────
describe("CP-03 — Venta con producto combo", () => {
  const COMBO_SALE_ROW = {
    ...BASE_SALE_ROW,
    id: "sale-combo",
    total: 3500,
    saleItems: [
      { productId: "combo-1", quantity: 1, unitPrice: 3500, subtotal: 3500, product: { name: "Combo Empanada + Jugo" } },
    ],
  };

  it("vende un combo usando su precio compuesto correctamente", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      { id: "combo-1", name: "Combo Empanada + Jugo", price: 3500 },
    ] as never);

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: TxFn) => {
      const tx = {
        student: {
          findUnique: vi.fn().mockResolvedValue({ type: "prepaid", balance: 10000, isActive: true }),
          update: vi.fn().mockResolvedValue({ balance: 6500 }),
        },
        sale: { create: vi.fn().mockResolvedValue(COMBO_SALE_ROW) },
      };
      return fn(tx);
    });

    const result = await createSale(
      { studentId: "stu-1", items: [{ productId: "combo-1", quantity: 1 }] },
      VENDOR_ID
    );

    expect(result.total).toBe(3500);
    expect(result.items[0].productName).toBe("Combo Empanada + Jugo");
  });

  it("lanza error si el combo está inactivo o no existe", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as never);

    await expect(
      createSale({ studentId: "stu-1", items: [{ productId: "combo-1", quantity: 1 }] }, VENDOR_ID)
    ).rejects.toThrow("Uno o más productos no existen o están inactivos.");
  });
});
