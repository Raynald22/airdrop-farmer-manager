
import { prisma } from "@/lib/db";
import { decrypt } from "../encryption";
import { wrapEth } from "../actions/wrap-eth";
import { swapEthToUsdc } from "../actions/swap";
import { supplyWeth } from "../actions/lending";
import { createPublicClient, http, formatGwei } from "viem";
import { scroll } from "viem/chains";
import { sendTelegramMessage } from "../telegram";

export async function runAutoFarming(userId: string) {
    console.log(`🤖 Starting Auto-Farming for user: ${userId}`);

    // 1. Find the target user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallets: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.tier !== "whale") {
        throw new Error("User is not a whale. Upgrade to access.");
    }

    console.log(`Found user: ${user.email} (${user.tier})`);

    const results = [];

    // 2. Check Gas Price (Scroll)
    // We use a public client to check gas before iterating
    const publicClient = createPublicClient({
        chain: scroll,
        transport: http()
    });

    const gasPrice = await publicClient.getGasPrice();
    const gasGwei = Number(formatGwei(gasPrice));
    const MAX_GWEI = Number(process.env.MAX_GWEI) || 25;

    console.log(`  ⛽ Current Gas: ${gasGwei.toFixed(2)} Gwei (Limit: ${MAX_GWEI})`);

    if (gasGwei > MAX_GWEI) {
        console.warn(`  ⚠️ Gas too high! Skipping farming run.`);
        return [{ error: `Gas too high: ${gasGwei.toFixed(2)} Gwei` }];
    }

    // 3. Iterate wallets
    for (const wallet of user.wallets) {
        if (wallet.type !== "EVM") continue;
        if (!wallet.encryptedPrivateKey) continue;

        try {
            console.log(`\nFarm processing: ${wallet.address}...`);

            // 3. Decrypt Key
            const privateKey = decrypt(wallet.encryptedPrivateKey);

            // 4. Randomize Action
            const actions = ["WRAP", "SWAP", "LEND"];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            let txHash = "";

            if (randomAction === "WRAP") {
                txHash = await wrapEth(privateKey);
            } else if (randomAction === "SWAP") {
                txHash = await swapEthToUsdc(privateKey);
            } else if (randomAction === "LEND") {
                txHash = await supplyWeth(privateKey, "scroll"); // Default to Scroll for now
            }

            // 5. Send Notification & Telegram
            if (txHash) {
                const message = `🌾 Auto-Farming Success (${randomAction})\nWallet: ${wallet.address.substring(0, 6)}...\nTx: ${txHash}`;

                await prisma.alert.create({
                    data: {
                        userId: user.id,
                        type: "task_completed",
                        priority: "success",
                        title: `Auto-Farming Success (${randomAction})`,
                        message: `Executed ${randomAction} for ${wallet.address.substring(0, 6)}... Tx: ${txHash.substring(0, 10)}...`,
                        read: false
                    }
                });

                if (user.telegramChatId) {
                    await sendTelegramMessage(user.telegramChatId, message);
                }

                results.push({ wallet: wallet.address, status: "success", tx: txHash });
            }

            // Short delay for API responsiveness (don't wait 30s here, maybe background job later)
            // For MVP, we wait 2s just to not hammer RPC
            await new Promise(r => setTimeout(r, 2000));

        } catch (error) {
            console.error(`  ❌ Failed to farm: ${error}`);

            const message = `⚠️ Auto-Farming Failed\nWallet: ${wallet.address.substring(0, 6)}...\nError: ${String(error).substring(0, 50)}`;

            await prisma.alert.create({
                data: {
                    userId: user.id,
                    type: "info",
                    priority: "critical",
                    title: "Auto-Farming Failed",
                    message: `Failed to execute task for ${wallet.address.substring(0, 6)}...`,
                    read: false
                }
            });

            if (user.telegramChatId) {
                await sendTelegramMessage(user.telegramChatId, message);
            }

            results.push({ wallet: wallet.address, status: "failed", error: String(error) });
        }
    }

    return results;
}
