import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { authorizeAdmin } from "@/lib/api-auth";
import { createRecharge, listRecentRecharges } from "@/modules/recharges/services/recharge.service";
import { createRechargeSchema } from "@/modules/recharges/schemas/recharge.schema";

export async function GET() {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  const recharges = await listRecentRecharges();
  return NextResponse.json({ recharges });
}

export async function POST(req: NextRequest) {
  const authError = await authorizeAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const validated = createRechargeSchema.parse(body);
    const recharge = await createRecharge(validated);
    return NextResponse.json({ recharge }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Datos inválidos.", details: error.flatten() }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}
