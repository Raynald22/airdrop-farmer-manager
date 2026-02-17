
import { PrismaClient } from "@prisma/client";
import { decrypt } from "../lib/encryption";
import { wrapEth } from "../lib/actions/wrap-eth";
import { swapEthToUsdc } from "../lib/actions/swap";

const prisma = new PrismaClient();
const TARGET_EMAIL = "inyourd7@gmail.com";

async function main() {
    console.log("🤖 Starting Auto-Farming Bot...");

    // 1. Find the target user
    const user = await prisma.user.findUnique({
        where: { email: TARGET_EMAIL },
        include: { wallets: true }
    });

    if (!user) {
        console.error(`User ${TARGET_EMAIL} not found.`);
        return;
    }

    if (user.tier !== "whale") {
        console.error("User is not a whale. Autoskip.");
        return;
    }

    console.log(`Found user: ${user.email} (${user.tier})`);
    console.log(`Wallets: ${user.wallets.length}`);

    // 2. Iterate wallets
    for (const wallet of user.wallets) {
        if (wallet.type !== "EVM") {
            console.log(`Skipping ${wallet.address}: Not an EVM wallet.`);
            continue;
        }

        if (!wallet.encryptedPrivateKey) {
            console.log(`Skipping ${wallet.address}: No private key set.`);
            continue;
        }

        try {
            console.log(`\nFarm processing: ${wallet.address}...`);

            // 3. Decrypt Key
            const privateKey = decrypt(wallet.encryptedPrivateKey);
            // In a real scenario, use this key with ethers.js / viem


            // 4. Execute "Wrap ETH" Action - Scroll
            console.log(`  > Decrypt success.`);

            // 5. Randomize Action
            const randomAction = Math.random() > 0.5 ? "WRAP" : "SWAP";
            let txHash = "";

            if (randomAction === "WRAP") {
                console.log("  🎲 Strategy: Wrap ETH (WETH)");
                txHash = await wrapEth(privateKey);
            } else {
                console.log("  🎲 Strategy: Swap ETH -> USDC");
                txHash = await swapEthToUsdc(privateKey);
            }

            // 6. Send Notification
            if (txHash) {
                await prisma.alert.create({
                    data: {
                        userId: user.id,
                        type: "task_completed",
                        priority: "success",
                        title: `Auto-Farming Success (${randomAction})`,
                        message: `Successfully executed ${randomAction} on Scroll. Tx: ${txHash.substring(0, 10)}...`,
                        read: false
                    }
                });
                console.log(`  🔔 Notification sent.`);
            }

            // 7. Anti-Sybil Delay (10s - 30s)
            const delayMs = Math.floor(Math.random() * 20000) + 10000;
            console.log(`  ⏳ Sleeping for ${delayMs / 1000}s before next wallet...`);
            await new Promise(r => setTimeout(r, delayMs));

        } catch (error) {
            console.error(`  ❌ Failed to farm: ${error}`);
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
        }
    }

    console.log("\n🤖 Auto-Farming Cycle Complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
