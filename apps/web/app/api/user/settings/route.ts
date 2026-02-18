
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { settings: true }
        });

        // Default settings if null
        const settings = user?.settings || {
            maxGwei: 30,
            minBalance: "0.001",
            tradingEnabled: true
        };

        return NextResponse.json(settings);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const body = await req.json();

        // Validate inputs (basic)
        const settings = {
            maxGwei: Number(body.maxGwei) || 30,
            minBalance: String(body.minBalance) || "0.001",
            tradingEnabled: Boolean(body.tradingEnabled)
        };

        await prisma.user.update({
            where: { id: userId },
            data: { settings: settings as any }
        });

        return NextResponse.json(settings);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
