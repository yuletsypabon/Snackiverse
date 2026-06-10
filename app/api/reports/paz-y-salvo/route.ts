import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      balance: { gte: 0 },
    },
    select: {
      id: true,
      name: true,
      grade: true,
      type: true,
      balance: true,
    },
    orderBy: [{ grade: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ students });
}
