import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { createCategory, listCategoriesWithCount } from "@/modules/products/services/category.service";

export async function GET() {
  const categories = await listCategoriesWithCount();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }
    const category = await createCategory({ name: body.name, icon: body.icon });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error interno.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
