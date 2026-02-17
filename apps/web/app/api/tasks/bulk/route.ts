import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { walletIds, taskId, status } = await req.json();

        if (!walletIds || !Array.isArray(walletIds) || !taskId || !status) {
            return new NextResponse("Invalid request body", { status: 400 });
        }

        // Verify all wallets belong to the user
        // This is important for security so user A can't update user B's wallets
        const count = await prisma.wallet.count({
            where: {
                id: { in: walletIds },
                userId: userId, // Must belong to auth user
            },
        });

        if (count !== walletIds.length) {
            return new NextResponse("One or more wallets invalid or unauthorized", { status: 403 });
        }

        // Perform bulk upsert
        // Prisma doesn't have a simple "bulk upsert" for many-to-many with custom fields easily
        // But we can use a transaction with map

        await prisma.$transaction(
            walletIds.map((walletId) =>
                prisma.walletTask.upsert({
                    where: {
                        walletId_taskId: {
                            walletId,
                            taskId
                        }
                    },
                    create: {
                        walletId,
                        taskId,
                        status,
                        completedAt: status === "completed" ? new Date() : null
                    },
                    update: {
                        status,
                        completedAt: status === "completed" ? new Date() : null
                    }
                })
            )
        );

        return NextResponse.json({ success: true, count: walletIds.length });

    } catch (error) {
        console.error("[TASKS_BULK_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
