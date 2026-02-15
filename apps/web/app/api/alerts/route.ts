import { NextResponse } from "next/server";
import { generateAlerts, type Alert } from "@/lib/alerts";

/**
 * GET /api/alerts
 * Returns mock alerts for the current user's wallets.
 * In production, this reads from the database and background job results.
 */
export async function GET() {
    // Mock: In production, fetch alerts from database
    const mockAlerts: Alert[] = [
        {
            id: "alert-demo-1",
            type: "inactivity",
            priority: "warning",
            title: "Wallet Inactive",
            message: "Wallet 0xd8dA...6045 has been idle for 35 days on zkSync Era.",
            walletAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            createdAt: new Date(),
            read: false,
        },
        {
            id: "alert-demo-2",
            type: "opportunity",
            priority: "info",
            title: "New Farming Opportunity",
            message: "Scroll has announced a new points campaign. Bridge and interact to qualify.",
            createdAt: new Date(),
            read: false,
            actionUrl: "https://scroll.io",
        },
        {
            id: "alert-demo-3",
            type: "low_balance",
            priority: "critical",
            title: "Low Gas Balance",
            message: "Wallet 0x5038...23Da has < 0.005 ETH on Base. Top up to continue farming.",
            walletAddress: "0x503828976D22510aad0201ac7EC88293211D23Da",
            chainId: 8453,
            createdAt: new Date(),
            read: false,
        },
    ];

    return NextResponse.json({ alerts: mockAlerts });
}
