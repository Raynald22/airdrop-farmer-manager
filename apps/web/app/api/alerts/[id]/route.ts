
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

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

        // Verify ownership
        const alert = await prisma.alert.findUnique({
            where: { id },
        });

        if (!alert || alert.userId !== userId) {
            return new NextResponse("Not Found", { status: 404 });
        }

        const updated = await prisma.alert.update({
            where: { id },
            data: { read: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("[ALERT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
