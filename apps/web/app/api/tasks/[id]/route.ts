import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

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

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                airdrop: true,
                walletTasks: { // use camel case if prisma client is updated, or cast to any if stuck
                    where: {
                        wallet: { userId }
                    },
                    include: {
                        wallet: true
                    }
                }
            },
        });

        if (!task) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(task);

    } catch (error) {
        console.error("[TASK_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
