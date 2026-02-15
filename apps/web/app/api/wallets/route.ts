import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { z } from "zod";

const createWalletSchema = z.object({
    address: z.string().startsWith("0x"),
    label: z.string().optional(),
});

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(wallets);
    } catch (error) {
        console.error("[WALLETS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const body = createWalletSchema.parse(json);

        // Ensure user exists in DB first (sync with Clerk)
        // In a real app, use Webhooks. Here we upsert on the fly for simplicity.
        await prisma.user.upsert({
            where: { id: userId },
            create: {
                id: userId,
                email: "placeholder@example.com", // Clerk webhooks handles real email sync
            },
            update: {},
        });

        const wallet = await prisma.wallet.create({
            data: {
                userId,
                address: body.address,
                label: body.label,
            },
        });

        return NextResponse.json(wallet);
    } catch (error) {
        console.error("[WALLETS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
