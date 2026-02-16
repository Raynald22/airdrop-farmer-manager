import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { chainDataService } from "@/lib/chain-data";

export const dynamic = "force-dynamic";

export async function POST(
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
            include: { stats: true },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found", { status: 404 });
        }

        // Fetch real data
        const stats = await chainDataService.getAllStats(wallet.address);

        // Update DB
        await Promise.all(
            stats.map((stat: any) =>
                prisma.walletStat.upsert({
                    where: {
                        walletId_chainId: {
                            walletId: wallet.id,
                            chainId: stat.chainId,
                        },
                    },
                    create: {
                        walletId: wallet.id,
                        chainId: stat.chainId,
                        balance: parseFloat(stat.balance),
                        txCount: stat.txCount,
                        volumeUsd: 0, // Need external API for this
                        fetchedAt: new Date(),
                    },
                    update: {
                        balance: parseFloat(stat.balance),
                        txCount: stat.txCount,
                        fetchedAt: new Date(),
                    },
                })
            )
        );

        return NextResponse.json({ success: true, stats });
    } catch (error) {
        console.error("[REFRESH_STATS]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
