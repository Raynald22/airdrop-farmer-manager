import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";


export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // Validate ownership
        const wallet = await prisma.wallet.findUnique({
            where: { id },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found or unauthorized", { status: 404 });
        }

        // Update fields
        const updatedWallet = await prisma.wallet.update({
            where: { id },
            data: {
                notes: body.notes !== undefined ? body.notes : undefined,
                label: body.label !== undefined ? body.label : undefined,
                groups: body.groups !== undefined ? {
                    set: body.groups.map((groupId: string) => ({ id: groupId })),
                } : undefined,
            },
            include: { groups: true },
        });

        return NextResponse.json(updatedWallet);
    } catch (error) {
        console.error("[WALLET_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;

        const wallet = await prisma.wallet.findUnique({
            where: { id },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found or unauthorized", { status: 404 });
        }

        await prisma.wallet.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[WALLET_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
