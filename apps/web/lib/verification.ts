import { prisma } from "@/lib/db";
import { getChainData } from "@/lib/chain-data";

/**
 * Verifies if a task has been completed on-chain.
 * 
 * @param walletId The ID of the wallet to verify
 * @param taskId The ID of the task to verify
 * @returns boolean indicating success
 */
export async function verifyTaskOnChain(walletId: string, taskId: string): Promise<boolean> {
    const wallet = await prisma.wallet.findUnique({
        where: { id: walletId },
    });

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { airdrop: true },
    });

    if (!wallet || !task) return false;

    // Logic based on Task Title or ID
    // specific to our seed data

    // 1. Scroll Tasks
    if (task.airdrop.slug === "scroll-mainnet") {
        const stats = await getChainData(wallet.address, "EVM"); // Scroll is EVM
        // In a real app, strict chain ID checks would happen here. 
        // Our getChainData returns aggregated or specific chain data.
        // For MVP, we'll assume if we can fetch Scroll stats, we check them.

        // Mocking chain specific fetch since getChainData is generic in this repo 
        // (Enhancement: verify specific chain ID for Scroll (534352))

        if (task.title.includes("Bridge")) {
            // Check if balance > 0.01 ETH (approx proxy for valid bridge)
            // simplified: check if they have any balance on the assumption they bridged
            const hasBalance = stats.balance > 0;
            return hasBalance;
        }

        if (task.title.includes("Deploy")) {
            // Check if tx count > 5 (proxy for having interaction)
            return stats.txCount > 5;
        }
    }

    // 2. Linea Tasks
    if (task.airdrop.slug === "linea-surge") {
        const stats = await getChainData(wallet.address, "EVM");

        if (task.title.includes("Liquidity")) {
            // Proxy: Check for high volume or balance
            return stats.volumeUsd > 100;
        }
    }

    // Default: If marked onchain_verify but logic missing, fail safe or return true for demo?
    // Let's return false to simulate "work needed"
    return false;
}
