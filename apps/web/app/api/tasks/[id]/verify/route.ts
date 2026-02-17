import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { verifyTaskOnChain } from "@/lib/verification";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: taskId } = await params;

    try {
        const { walletId } = await req.json();

        if (!walletId) {
            return new NextResponse("Wallet ID required", { status: 400 });
        }

        // Security check: wallet belongs to user
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId, userId },
        });

        if (!wallet) return new NextResponse("Unauthorized wallet", { status: 403 });

        // Perform Verification
        const isVerified = await verifyTaskOnChain(walletId, taskId);

        if (isVerified) {
            // Update status
            await prisma.walletTask.upsert({
                where: {
                    walletId_taskId: {
                        walletId,
                        taskId
                    }
                },
                create: {
                    walletId,
                    taskId,
                    status: "completed",
                    completedAt: new Date()
                },
                update: {
                    status: "completed",
                    completedAt: new Date()
                }
            });
        }

        return NextResponse.json({ verified: isVerified });

    } catch (error) {
        console.error("[TASK_VERIFY_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
