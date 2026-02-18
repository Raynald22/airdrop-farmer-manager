
import { prisma } from "@/lib/db";
import { decrypt } from "../encryption";
import { wrapEth } from "../actions/wrap-eth";
import { swapEthToUsdc, SwapChain } from "../actions/swap";
import { supplyWeth, LendingChain } from "../actions/lending";
import { swapSyncSwap } from "../actions/syncswap";
import { createPublicClient, http, formatGwei, Chain } from "viem";
import { scroll, base, linea, baseSepolia, scrollSepolia, lineaSepolia } from "viem/chains";
import { sendTelegramMessage } from "../telegram";

type FarmingChain = "scroll" | "base" | "linea" | "base-sepolia" | "scroll-sepolia" | "linea-sepolia";
type FarmingAction = "SWAP" | "LEND" | "WRAP" | "SYNCSWAP";

const MAINNET_CHAINS: FarmingChain[] = ["scroll", "base", "linea"];
const TESTNET_CHAINS: FarmingChain[] = ["base-sepolia", "scroll-sepolia", "linea-sepolia"];

const ACTIONS: FarmingAction[] = ["SWAP", "LEND", "SYNCSWAP"]; // Removed WRAP for simplicity on testnets for now

export async function runAutoFarming(userId: string) {
    console.log(`🤖 Starting Auto-Farming for user: ${userId}`);

    // 1. Find the target user
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { wallets: true }
    });

    if (!user) throw new Error("User not found");
    // if (user.tier !== "whale") throw new Error("User is not a whale. Upgrade to access.");

    // if (user.tier !== "whale") throw new Error("User is not a whale. Upgrade to access.");
    // Commented out tier check for dev convenience/testing

    // Parse Settings
    const settings = (user.settings as any) || {};
    const tradingEnabled = settings.tradingEnabled !== false; // Default true
    const userMaxGwei = settings.maxGwei || Number(process.env.MAX_GWEI) || 25;

    console.log(`Found user: ${user.email} (${user.tier})`);
    console.log(`  ⚙️ Settings: Trading=${tradingEnabled}, MaxGwei=${userMaxGwei}`);

    if (!tradingEnabled) {
        console.log("  ⛔ Auto-Farming is DISABLED by user settings.");
        return [];
    }

    const results = [];
    // const MAX_GWEI = Number(process.env.MAX_GWEI) || 25; // Replaced by userMaxGwei
    const isDev = process.env.NODE_ENV === "development";

    const CHAINS = isDev ? TESTNET_CHAINS : MAINNET_CHAINS;
    console.log(`  🔍 Mode: ${isDev ? "TESTNET" : "MAINNET"}. Chains: ${CHAINS.join(", ")}`);

    // Helper to get chain obj
    const getChainObj = (c: FarmingChain): Chain => {
        switch (c) {
            case "scroll": return scroll;
            case "base": return base;
            case "linea": return linea;
            case "base-sepolia": return baseSepolia;
            case "scroll-sepolia": return scrollSepolia;
            case "linea-sepolia": return lineaSepolia;
            default: return scroll;
        }
    }

    // Helper to check gas
    const checkGas = async (chain: FarmingChain) => {
        const client = createPublicClient({
            chain: getChainObj(chain),
            transport: http()
        });
        const gasPrice = await client.getGasPrice();
        const gwei = Number(formatGwei(gasPrice));
        console.log(`  ⛽ [${chain.toUpperCase()}] Gas: ${gwei.toFixed(2)} Gwei (Limit: ${isDev ? 100 : userMaxGwei})`);
        return gwei <= (isDev ? 100 : userMaxGwei); // Use user setting, unless dev mode override
    };

    // 3. Iterate wallets
    for (const wallet of user.wallets) {
        if (wallet.type !== "EVM" || !wallet.encryptedPrivateKey) continue;

        try {
            console.log(`\nFarm processing: ${wallet.address}...`);

            // 3. Decrypt Key
            const privateKey = decrypt(wallet.encryptedPrivateKey);

            // 4. Randomize Action & Chain
            // Improved randomization: Pick a random chain that has safe gas
            let selectedChain: FarmingChain | null = null;

            // Try up to 3 times to find a cheap chain
            for (let i = 0; i < 3; i++) {
                const candidate = CHAINS[Math.floor(Math.random() * CHAINS.length)];
                if (await checkGas(candidate)) {
                    selectedChain = candidate;
                    break;
                }
            }

            if (!selectedChain) {
                console.warn(`  ⚠️ Gas too high on all checked chains. Skipping wallet.`);
                results.push({ wallet: wallet.address, status: "skipped", reason: "high_gas" });
                continue;
            }

            const selectedAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
            let txHash = "";

            console.log(`  👉 Strategy: ${selectedAction} on ${selectedChain.toUpperCase()}`);

            if (selectedAction === "WRAP" && (selectedChain === "scroll" || selectedChain === "scroll-sepolia")) {
                txHash = await wrapEth(privateKey);
            } else if (selectedAction === "SWAP") {
                txHash = await swapEthToUsdc(privateKey, selectedChain as SwapChain);
            } else if (selectedAction === "LEND") {
                // Skip Lending on Linea Sepolia explicitly if selected
                if (selectedChain === "linea-sepolia") {
                    console.log("  ⚠️ Skipping LEND on Linea Sepolia (No Pool). Swapping to SWAP.");
                    txHash = await swapEthToUsdc(privateKey, selectedChain as SwapChain);
                } else {
                    txHash = await supplyWeth(privateKey, selectedChain as LendingChain);
                }
            } else if (selectedAction === "SYNCSWAP") {
                // SyncSwap only on Scroll Mainnet for now as per implementation (and maybe Linea Mainnet later)
                // If testnet or other chain, fallback to standard Swap
                if (selectedChain === "scroll") {
                    txHash = await swapSyncSwap(privateKey, "scroll");
                } else {
                    console.log(`  ⚠️ SyncSwap not available on ${selectedChain}. Fallback to Uniswap.`);
                    txHash = await swapEthToUsdc(privateKey, selectedChain as SwapChain);
                }
            } else {
                console.log("  ⚠️ Skipping invalid combo, defaulting to Swap");
                txHash = await swapEthToUsdc(privateKey, selectedChain as SwapChain);
            }

            // 5. Send Notification
            if (txHash) {
                const message = `🌾 Auto-Farming Success\nAction: ${selectedAction} on ${selectedChain.toUpperCase()}\nWallet: ${wallet.address.substring(0, 6)}...\nTx: ${txHash}`;

                await prisma.alert.create({
                    data: {
                        userId: user.id,
                        type: "task_completed",
                        priority: "success",
                        title: `Farming Success: ${selectedAction} (${selectedChain})`,
                        message: `Tx: ${txHash.substring(0, 10)}...`,
                        read: false
                    }
                });

                if (user.telegramChatId) {
                    await sendTelegramMessage(user.telegramChatId, message);
                }

                results.push({ wallet: wallet.address, status: "success", tx: txHash, chain: selectedChain });
            }

            // Short delay
            await new Promise(r => setTimeout(r, 2000));

        } catch (error) {
            console.error(`  ❌ Failed to farm: ${error}`);
            results.push({ wallet: wallet.address, status: "failed", error: String(error) });
        }
    }

    return results;
}
