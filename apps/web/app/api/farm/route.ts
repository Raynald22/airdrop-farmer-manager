
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { runAutoFarming } from "@/lib/services/farming";

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // Run the farming logic
        // Note: In Vercel serverless, this might timeout if > 10s (Hobby) or 60s (Pro).
        // Since we reduced the delay to 2s/wallet, it should be okay for a few wallets.
        const results = await runAutoFarming(userId);

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("[FARM_POST]", error);
        return new NextResponse(error.message || "Internal Error", { status: 500 });
    }
}
