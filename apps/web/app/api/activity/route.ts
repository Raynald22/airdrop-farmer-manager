import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Fetch recent completed tasks
        const completedTasks = await (prisma as any).walletTask.findMany({
            where: {
                wallet: { userId },
                status: "completed",
            },
            include: {
                wallet: true,
                task: {
                    include: { airdrop: true }
                }
            },
            orderBy: { completedAt: "desc" },
            take: 10,
        });

        // Fetch recent wallet creations
        const newWallets = await prisma.wallet.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 5
        });

        // Combine and sort
        const activity = [
            ...completedTasks.map((t: any) => ({
                type: "task_completed",
                id: t.id,
                timestamp: t.completedAt || new Date(),
                wallet: t.wallet.label || t.wallet.address,
                details: `${t.task.title} (${t.task.airdrop.name})`
            })),
            ...newWallets.map((w: any) => ({
                type: "wallet_added",
                id: w.id,
                timestamp: w.createdAt,
                wallet: w.label || w.address,
                details: w.type.toString()
            }))
        ].sort((a: any, b: any) => {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }).slice(0, 10);

        return NextResponse.json(activity);

    } catch (error) {
        console.error("[ACTIVITY_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
