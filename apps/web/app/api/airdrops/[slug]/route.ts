
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { slug } = await params;

    try {
        const airdrop = await prisma.airdrop.findUnique({
            where: { slug: slug },
            include: {
                tasks: {
                    orderBy: { points: "asc" }, // or whatever order logic
                },
            },
        });

        if (!airdrop) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // TODO: We might want to fetch user-specific task progress here too
        // For now, returning the airdrop definition
        return NextResponse.json(airdrop);
    } catch (error) {
        console.error("[AIRDROP_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { slug } = await params;

    try {
        const airdrop = await prisma.airdrop.delete({
            where: { slug },
        });

        return NextResponse.json(airdrop);
    } catch (error) {
        console.error("[AIRDROP_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
