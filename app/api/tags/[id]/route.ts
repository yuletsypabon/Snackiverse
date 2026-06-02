import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { deleteTag } from "@/modules/tags/services/tag.service";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    ) {
    const denied = await authorizeAdmin();
    if (denied) return denied;

    const { id } = await params;
    await deleteTag(id);
    return new NextResponse(null, { status: 204 });
}