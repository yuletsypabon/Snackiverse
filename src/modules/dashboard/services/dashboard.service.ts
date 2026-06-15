import { prisma } from "@/lib/prisma";

const LOW_BALANCE_THRESHOLD = 5000;

export async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    salesToday,
    salesYesterday,
    recentSales,
    studentCount,
    productCount,
    deudoresCount,
    lowBalanceStudents,
    salesCountToday,
    debtorStudents,
    expiringTiqueteras,
  ] = await Promise.all([
    // Total vendido hoy
    prisma.sale.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),

    // Total vendido ayer (para comparativa)
    prisma.sale.aggregate({
      where: {
        createdAt: {
          gte: new Date(todayStart.getTime() - 86400000),
          lt: todayStart,
        },
      },
      _sum: { total: true },
    }),

    // Últimas 10 ventas
    prisma.sale.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        total: true,
        createdAt: true,
        student: { select: { id: true, name: true, grade: true } },
        vendor: { select: { id: true, name: true } },
        saleItems: {
          select: {
            quantity: true,
            product: { select: { name: true } },
          },
        },
      },
    }),

    // Total estudiantes activos
    prisma.student.count({ where: { isActive: true } }),

    // Total productos activos
    prisma.product.count({ where: { isActive: true } }),

    // Deudores: prepago con saldo negativo
    prisma.student.count({
      where: { isActive: true, type: "prepaid", balance: { lt: 0 } },
    }),

    // Alertas saldo bajo (no negativo, pero por debajo del umbral)
    prisma.student.findMany({
      where: {
        isActive: true,
        type: "prepaid",
        balance: { lt: LOW_BALANCE_THRESHOLD },
      },
      select: { id: true, name: true, grade: true, balance: true },
      orderBy: { balance: "asc" },
    }),

    // Número de ventas hoy
    prisma.sale.count({ where: { createdAt: { gte: todayStart } } }),

    // Deudores: prepago con saldo negativo
    prisma.student.findMany({
      where: { isActive: true, type: "prepaid", balance: { lt: 0 } },
      select: { id: true, name: true, grade: true, balance: true },
      orderBy: { balance: "asc" },
      take: 10,
    }),

    // Tiqueteras por vencer en los próximos 5 días
    prisma.student.findMany({
      where: {
        isActive: true,
        type: { in: ["monthly", "biweekly", "weekly"] },
        tiqueteraExpiresAt: {
          gte: todayStart,
          lte: new Date(todayStart.getTime() + 30 * 86400000),
        },
      },
      select: { id: true, name: true, grade: true, type: true, tiqueteraExpiresAt: true },
      orderBy: { tiqueteraExpiresAt: "asc" },
      take: 15,
    }),

  ]);

  return {
    salesTodayTotal: salesToday._sum.total ?? 0,
    salesYesterdayTotal: salesYesterday._sum.total ?? 0,
    salesCountToday,
    recentSales: recentSales.map((s) => ({
      id: s.id,
      total: s.total,
      createdAt: s.createdAt.toISOString(),
      studentName: s.student?.name ?? "Venta libre",
      studentGrade: s.student?.grade ?? null,
      vendorName: s.vendor.name,
      itemCount: s.saleItems.reduce((sum, i) => sum + i.quantity, 0),
    })),
    studentCount,
    productCount,
    deudoresCount,
    lowBalanceStudents: lowBalanceStudents.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      balance: s.balance,
    })),
    debtorStudents: debtorStudents.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      balance: s.balance,
    })),
    expiringTiqueteras: expiringTiqueteras.map((s) => ({
      id: s.id,
      name: s.name,
      grade: s.grade,
      type: s.type,
      expiresAt: s.tiqueteraExpiresAt!.toISOString(),
    })),
  };
}
