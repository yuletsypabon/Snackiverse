import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/modules/auth/utils/password";
import type { CreateVendorInput, VendorDto } from "../schemas/vendor.schema";

function toVendorDto(v: { id: string; name: string; email: string; createdAt: Date }): VendorDto {
    return { id: v.id, name: v.name, email: v.email, createdAt: v.createdAt.toISOString() };
    }

    export async function listVendors(): Promise<VendorDto[]> {
    const vendors = await prisma.user.findMany({
        where: { role: "vendor" },
        select: { id: true, name: true, email: true, createdAt: true },
        orderBy: { createdAt: "desc" },
    });
    return vendors.map(toVendorDto);
    }

    export async function createVendor(input: CreateVendorInput): Promise<VendorDto> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });

    if (existing) {
        throw new Error("Ese correo ya está registrado");
    }

    const vendor = await prisma.user.create({
        data: {
        name: input.name,
        email: input.email,
        password: await hashPassword(input.password),
        role: "vendor",
        },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return toVendorDto(vendor);
}

export async function updateVendorPassword(id: string, newPassword: string): Promise<void> {
    const vendor = await prisma.user.findUnique({ where: { id, role: "vendor" } });

    if (!vendor) {
        throw new Error("Vendedor no encontrado.");
    }

    await prisma.user.update({
        where: { id },
        data: { password: await hashPassword(newPassword) },
    });
}