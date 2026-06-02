import { prisma } from "@/lib/prisma";
import type { CreateTagInput, TagDto } from "../schemas/tag.schema";

export async function listTags(): Promise<TagDto[]> {
    return prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    }

    export async function createTag(input: CreateTagInput): Promise<TagDto> {
    return prisma.tag.create({
        data: { name: input.name.trim() },
        select: { id: true, name: true },
    });
    }

    export async function deleteTag(id: string): Promise<void> {
    await prisma.tag.delete({ where: { id } });
}