import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/api-auth";
import { listTags, createTag } from "@/modules/tags/services/tag.service";
import { createTagSchema } from "@/modules/tags/schemas/tag.schema";

export async function GET() {
    const tags = await listTags();
    return NextResponse.json(tags);
    }

    export async function POST(req: NextRequest) {
    const denied = await authorizeAdmin();
    if (denied) return denied;

    const body = await req.json();
    const parsed = createTagSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const tag = await createTag(parsed.data);
    return NextResponse.json(tag, { status: 201 });
}