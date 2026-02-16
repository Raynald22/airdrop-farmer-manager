
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const airdrops = await prisma.airdrop.findMany({
            where: { status: "active" },
            include: {
                tasks: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(airdrops);
    } catch (error) {
        console.error("[AIRDROPS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
