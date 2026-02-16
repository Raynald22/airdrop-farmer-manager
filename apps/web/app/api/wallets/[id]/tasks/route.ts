
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// GET: Fetch tasks for a specific wallet
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { id } = await params;

        // Verify wallet belongs to user
        const wallet = await prisma.wallet.findUnique({
            where: { id },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found", { status: 404 });
        }

        const tasks = await prisma.walletTask.findMany({
            where: { walletId: id },
            include: {
                task: true,
            },
        });

        // Transform to map for easier frontend lookup { taskId: status }
        const taskMap = tasks.reduce<Record<string, string>>((acc, curr) => {
            acc[curr.taskId] = curr.status;
            return acc;
        }, {});

        return NextResponse.json(taskMap);
    } catch (error) {
        console.error("[WALLET_TASKS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Update task status
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
        const { taskId, status } = await req.json();

        // Verify wallet belongs to user
        const wallet = await prisma.wallet.findUnique({
            where: { id },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found", { status: 404 });
        }

        const walletTask = await prisma.walletTask.upsert({
            where: {
                walletId_taskId: {
                    walletId: id,
                    taskId,
                },
            },
            create: {
                walletId: id,
                taskId,
                status,
                completedAt: status === "completed" ? new Date() : null,
            },
            update: {
                status,
                completedAt: status === "completed" ? new Date() : null,
            },
        });

        return NextResponse.json(walletTask);
    } catch (error) {
        console.error("[WALLET_TASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
