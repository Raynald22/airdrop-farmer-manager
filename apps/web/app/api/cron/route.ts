
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAutoFarming } from "@/lib/services/farming";

export async function GET(req: Request) {
    // 1. Verify Auth (CRON_SECRET)
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const authHeader = req.headers.get("authorization");

    // Allow simple key param OR Bearer token
    if (key !== process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("[CRON] Starting scheduled farming...");

        // 2. Find all Whale users
        const whales = await prisma.user.findMany({
            where: { tier: "whale" },
        });

        console.log(`[CRON] Found ${whales.length} whale users.`);

        const results = [];

        // 3. Run Farming for each
        for (const whale of whales) {
            try {
                const farmResults = await runAutoFarming(whale.id);
                results.push({ userId: whale.id, results: farmResults });
            } catch (error) {
                console.error(`[CRON] Failed for user ${whale.id}:`, error);
                results.push({ userId: whale.id, error: String(error) });
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error) {
        console.error("[CRON] Internal Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
