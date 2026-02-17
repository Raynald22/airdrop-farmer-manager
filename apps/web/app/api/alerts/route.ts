import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const alerts = await prisma.alert.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20, // Limit to recent 20
        });

        return NextResponse.json({ alerts });
    } catch (error) {
        console.error("[ALERTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
