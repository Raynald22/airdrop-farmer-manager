
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { detectSybilPatterns, WalletActivity } from "@/lib/sybil-detector";

export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            include: {
                stats: true,
            },
        });

        // Transform DB data to WalletActivity for the detector
        // Note: Since we don't have full history (indexer), we make some 
        // heuristics based on available stats for demonstration.
        const analysisData: WalletActivity[] = wallets.map((w) => {
            const totalTx = w.stats.reduce((sum, s) => sum + s.txCount, 0);
            const totalBalance = w.stats.reduce((sum, s) => sum + s.balance, 0);

            // Heuristic: If we have > 10 txs but low balance, maybe low diversity
            // This is a placeholder until we integrate a real indexer API.
            return {
                address: w.address,
                txCount: totalTx,
                uniqueContracts: Math.floor(totalTx * 0.4), // Simulated: 40% of txs are unique interactions
                avgTimeBetweenTx: 24, // Simulated: 1 tx per day
                hasBridged: w.stats.length > 1, // If active on multiple chains, assume bridged
                totalVolumeUsd: totalBalance * 3000, // Rough est based on ETH price
                activeMonths: Math.max(1, Math.floor(totalTx / 10)), // Rough est
                roundNumberTxPercent: 10, // Placeholder
            };
        });

        const reports = detectSybilPatterns(analysisData);

        // Convert Map to Object for JSON response
        const response: Record<string, any> = {};
        reports.forEach((report, address) => {
            response[address] = report;
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("[SYBIL_ANALYZE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
