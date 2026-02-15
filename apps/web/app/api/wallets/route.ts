import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
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
    const user = await currentUser();
    if (!user || !user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = user.id;
    const userEmail = user.emailAddresses?.[0]?.emailAddress || `${userId}@no-email.com`;

    try {
        const json = await req.json();
        const body = createWalletSchema.parse(json);

        // Ensure user exists in DB first (sync with Clerk)
        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            create: {
                id: userId,
                email: userEmail,
            },
            update: {
                email: userEmail, // Keep email in sync
            },
            include: {
                _count: {
                    select: { wallets: true },
                },
            },
        });

        const LIMITS = {
            free: 5,
            pro: 50,
            whale: 9999,
        };

        const currentCount = dbUser._count.wallets;
        const tier = (dbUser.tier || "free") as keyof typeof LIMITS;
        const limit = LIMITS[tier];

        if (currentCount >= limit) {
            return new NextResponse(`Plan limit reached (${limit} wallets). Upgrade to Pro.`, { status: 403 });
        }

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
