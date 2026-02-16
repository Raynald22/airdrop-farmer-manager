
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateGroupsSchema = z.object({
    groupIds: z.array(z.string()),
});

// GET: Get groups for a wallet
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
        const wallet = await prisma.wallet.findUnique({
            where: { id },
            include: {
                groups: true,
            },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found", { status: 404 });
        }

        return NextResponse.json(wallet.groups);
    } catch (error) {
        console.error("[WALLET_GROUPS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Set groups for a wallet (replace existing)
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
        const body = await req.json();
        const { groupIds } = updateGroupsSchema.parse(body);

        const wallet = await prisma.wallet.findUnique({
            where: { id },
        });

        if (!wallet || wallet.userId !== userId) {
            return new NextResponse("Not found", { status: 404 });
        }

        // Verify all groups belong to user
        const validGroups = await prisma.walletGroup.count({
            where: {
                id: { in: groupIds },
                userId,
            },
        });

        if (validGroups !== groupIds.length) {
            return new NextResponse("Invalid groups", { status: 400 });
        }

        // Update relation: disconnect all, connect new
        await prisma.wallet.update({
            where: { id },
            data: {
                groups: {
                    set: groupIds.map((gid) => ({ id: gid })),
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[WALLET_GROUPS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
