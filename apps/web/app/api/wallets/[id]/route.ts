import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

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
