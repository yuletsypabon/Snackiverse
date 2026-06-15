import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const type = req.nextUrl.searchParams.get("type") ?? "all";

  // Deudores = prepago con saldo negativo
  const where = {
    isActive: true,
    type: "prepaid" as const,
    balance: { lt: 0 },
    ...(type !== "all" && { type: type as "prepaid" }),
  };

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      name: true,
      grade: true,
      type: true,
      balance: true,
      guardianWhatsapp: true,
    },
    orderBy: [{ balance: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ students });
}
