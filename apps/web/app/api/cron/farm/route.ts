
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAutoFarming } from "@/lib/services/farming";

// Allow longer timeout for Cron jobs (Vercel specific)
export const maxDuration = 300;

export async function GET(req: Request) {
    // 1. Security Check
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    // Simple Bearer check
    if (!secret || authHeader !== `Bearer ${secret}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        console.log("⏰ Cron Job Started: Global Auto-Farming");

        // 2. Fetch Eligible Users
        // For this app, we iterate "pro" and "whale" users.
        // If you want it to run for everyone during dev, you can remove the where clause.
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { tier: "pro" },
                    { tier: "whale" },
                    // For dev purposes, maybe include "free" if explicitly enabled?
                    // Let's stick to the plan (Pro/Whale) to encourage upgrades :)
                    // But wait, user currently is likely "free" default?
                    // Let's include ALL users for now since it's a personal tool.
                    // Or check a flag.
                ]
            }
        });

        // Fallback: If no pro users found, just run for all (User request was "semuanya" / all features)
        // Modification: Let's run for ALL users who have wallets, to be useful immediately.
        const allUsers = users.length > 0 ? users : await prisma.user.findMany();

        console.log(`  Found ${allUsers.length} users to process.`);

        const results = [];

        // 3. Execute Farming
        for (const user of allUsers) {
            try {
                console.log(`  ▶ Processing user: ${user.email}`);
                const logs = await runAutoFarming(user.id);
                results.push({ userId: user.id, email: user.email, status: "success", actions: logs.length });
            } catch (e) {
                console.error(`  ❌ Failed for user ${user.id}:`, e);
                results.push({ userId: user.id, status: "failed", error: String(e) });
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            processed: allUsers.length,
            results
        });

    } catch (error) {
        console.error("Cron Job Fatal Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
