
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createGroupSchema = z.object({
    name: z.string().min(1, "Name is required"),
    color: z.string().optional(),
});

// GET: List all groups for user
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const groups = await prisma.walletGroup.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { wallets: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(groups);
    } catch (error) {
        console.error("[GROUPS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Create a new group
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, color } = createGroupSchema.parse(body);

        const group = await prisma.walletGroup.create({
            data: {
                userId,
                name,
                color,
            },
        });


        return NextResponse.json(group);
    } catch (error) {
        console.error("[GROUPS_POST]", error);
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid data", { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("Missing ID", { status: 400 });
        }

        const group = await prisma.walletGroup.delete({
            where: { id, userId },
        });

        return NextResponse.json(group);
    } catch (error) {
        console.error("[GROUPS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
