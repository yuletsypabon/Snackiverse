import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const now = new Date();

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      balance: { gte: 0 },
      OR: [
        // Prepago: saldo >= 0 (ya filtrado arriba)
        { type: "prepaid" },
        // Tiquetera: además debe tener tiquetera vigente y saldo >= 0
        {
          type: { in: ["weekly", "monthly", "biweekly"] },
          tiqueteraExpiresAt: { gte: now },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      grade: true,
      type: true,
      balance: true,
      tiqueteraExpiresAt: true,
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ students });
}
