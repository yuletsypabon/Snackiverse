import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { authorizeAdmin } from "@/lib/api-auth";
import { createVendorSchema } from "@/modules/vendors/schemas/vendor.schema";
import { createVendor, listVendors } from "@/modules/vendors/services/vendor.service";

export async function GET() {
    const unauthorized = await authorizeAdmin();
    if (unauthorized) return unauthorized;

    const vendors = await listVendors();
    return NextResponse.json({ success: true, vendors });
    }

    export async function POST(req: Request) {
    try {
        const unauthorized = await authorizeAdmin();
        if (unauthorized) return unauthorized;

        const body = await req.json();
        const validated = createVendorSchema.parse(body);
        const vendor = await createVendor(validated);

        return NextResponse.json({ success: true, vendor }, { status: 201 });
    } catch (error) {
        if (error instanceof ZodError) {
        return NextResponse.json(
            { success: false, error: "Revisa los datos.", details: error.flatten() },
            { status: 400 }
        );
        }
        if (error instanceof Error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 409 }
        );
        }
        return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
        );
    }
}