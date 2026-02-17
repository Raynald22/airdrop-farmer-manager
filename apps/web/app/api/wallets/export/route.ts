import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculateWalletScore } from "@/lib/scoring";

export async function GET(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const wallets = await prisma.wallet.findMany({
            where: { userId },
            include: {
                stats: true,
                groups: true,
            },
        });

        // CSV Header
        const headers = [
            "Address",
            "Type",
            "Label",
            "Groups",
            "Total Balance (USD)",
            "Transaction Count",
            "So Far Score",
            "Sybil Status",
        ];

        // CSV Rows
        const rows = wallets.map((wallet: any) => {
            // Aggregate stats
            const totalBalance = wallet.stats.reduce((acc: number, curr: any) => acc + (curr.balance || 0), 0);
            const totalTx = wallet.stats.reduce((acc: number, curr: any) => acc + (curr.txCount || 0), 0);
            const totalVolume = wallet.stats.reduce((acc: number, curr: any) => acc + (curr.volumeUsd || 0), 0);

            // Calculate Score
            // We can pass the wallet directly now as it matches the interface (mostly)
            // format of wallet.stats might need to match exactly what calculateWalletScore expects
            const { overall, status } = calculateWalletScore(wallet);

            // Groups
            const groupNames = wallet.groups ? wallet.groups.map((g: any) => g.name).join("; ") : "";

            return [
                wallet.address,
                wallet.type,
                wallet.label || "",
                groupNames,
                totalBalance.toFixed(2),
                totalTx,
                overall,
                status
            ].map(field => `"${field}"`).join(","); // Quote fields to handle commas
        });

        const csvContent = [headers.join(","), ...rows].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="wallets-export-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });

    } catch (error) {
        console.error("[WALLETS_EXPORT_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
