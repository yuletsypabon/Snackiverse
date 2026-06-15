import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { updateCategory, deleteCategory } from "@/modules/products/services/category.service";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const { id } = await params;
  try {
    const body = await req.json();
    const category = await updateCategory(id, { name: body.name, icon: body.icon });
    return NextResponse.json(category);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error interno.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const { id } = await params;
  try {
    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error interno.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
