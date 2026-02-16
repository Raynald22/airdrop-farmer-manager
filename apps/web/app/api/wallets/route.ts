import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createWalletSchema = z.object({
    address: z.string().min(20), // Valid for BTC, SOL, EVM
    label: z.string().optional(),
    type: z.enum(["EVM", "SOL", "BTC"]).default("EVM"),
});

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            include: { groups: true, stats: true },
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
        const start = Date.now();
        const json = await req.json();
        const body = createWalletSchema.parse(json);

        // Optimize: Separate user check/creation from wallet counting
        // DB call 1: Upsert user (fast)
        const dbUser = await prisma.user.upsert({
            where: { id: userId },
            create: { id: userId, email: userEmail },
            update: { email: userEmail },
        });

        const LIMITS = { free: 5, pro: 50, whale: 9999 };
        const tier = (dbUser.tier || "free") as keyof typeof LIMITS;
        const limit = LIMITS[tier];

        // DB call 2: Count wallets (only if necessary for limit check)
        const currentCount = await prisma.wallet.count({
            where: { userId },
        });

        if (currentCount >= limit) {
            return new NextResponse(`Plan limit reached (${limit} wallets). Upgrade to Pro.`, { status: 403 });
        }

        // DB call 3: Create wallet
        const wallet = await prisma.wallet.create({
            data: {
                userId,
                address: body.address,
                label: body.label,
                type: body.type, // Ensure this matches the schema enum
            },
        });

        const duration = Date.now() - start;
        console.log(`[WALLETS_POST] Success in ${duration}ms. Type: ${body.type}`);

        return NextResponse.json(wallet);
    } catch (error) {
        console.error("[WALLETS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
