
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding airdrops...");

    const scroll = await prisma.airdrop.upsert({
        where: { slug: "scroll-mainnet" },
        update: {},
        create: {
            name: "Scroll",
            slug: "scroll-mainnet",
            description: "Layer 2 zkEVM scaling solution for Ethereum.",
            chain: "Scroll",
            status: "active",
            tasks: {
                create: [
                    {
                        title: "Bridge to Scroll",
                        description: "Bridge at least 0.1 ETH to Scroll Mainnet via official bridge.",
                        points: 100,
                        type: "onchain_verify",
                        url: "https://scroll.io/bridge",
                    },
                    {
                        title: "Swap on Ambient",
                        description: "Perform a swap on Ambient Finance.",
                        points: 50,
                        type: "manual",
                        url: "https://ambient.finance",
                    },
                    {
                        title: "Deploy a Contract",
                        description: "Deploy any smart contract on Scroll.",
                        points: 200,
                        type: "onchain_verify",
                        url: "https://docs.scroll.io/en/developers",
                    },
                ],
            },
        },
    });

    const linea = await prisma.airdrop.upsert({
        where: { slug: "linea-surge" },
        update: {},
        create: {
            name: "Linea Surge",
            slug: "linea-surge",
            description: "ConsenSys zkEVM L2. Participate in the Surge program.",
            chain: "Linea",
            status: "active",
            tasks: {
                create: [
                    {
                        title: "Provide Liquidity on Nile",
                        description: "LP > $20 on Nile Exchange.",
                        points: 150,
                        type: "manual",
                        url: "https://www.nile.build",
                    },
                    {
                        title: "Bridge via Stargate",
                        description: "Bridge USDC to Linea using Stargate.",
                        points: 80,
                        type: "manual",
                        url: "https://stargate.finance",
                    },
                ],
            },
        },
    });

    // Explicitly update tasks to ensure URLs are set (fix for existing data)
    const allAirdrops = await prisma.airdrop.findMany({ include: { tasks: true } });

    for (const ad of allAirdrops) {
        if (ad.slug === "scroll-mainnet") {
            for (const t of ad.tasks) {
                if (t.title.includes("Bridge")) {
                    await prisma.task.update({
                        where: { id: t.id },
                        data: {
                            url: "https://scroll.io/bridge",
                            content: `
# Bridge to Scroll 📜

To qualify for the Scroll airdrop, bridging is the most essential step.

### Instructions:
1. Go to the [Official Scroll Bridge](https://scroll.io/bridge).
2. Connect your wallet (Ethereum Mainnet).
3. Enter the amount to bridge (min **0.1 ETH** recommended).
4. Confirm the transaction.

> **Tip:** Gas fees are lower on weekends! 
                            `.trim()
                        }
                    });
                }
                if (t.title.includes("Ambient")) {
                    await prisma.task.update({
                        where: { id: t.id },
                        data: {
                            url: "https://ambient.finance",
                            content: `
# Swap on Ambient 💸

Ambient is a zero-to-one decentralized trading protocol.

### Steps:
1. Visit [Ambient Finance](https://ambient.finance).
2. Switch network to **Scroll**.
3. Swap **ETH** for **USDC**.
4. (Optional) Provide liquidity in the ETH/USDC pool.
                            `.trim()
                        }
                    });
                }
                if (t.title.includes("Contract")) await prisma.task.update({ where: { id: t.id }, data: { url: "https://docs.scroll.io/en/developers" } });
            }
        }
        if (ad.slug === "linea-surge") {
            for (const t of ad.tasks) {
                if (t.title.includes("Nile")) await prisma.task.update({ where: { id: t.id }, data: { url: "https://www.nile.build" } });
                if (t.title.includes("Stargate")) await prisma.task.update({ where: { id: t.id }, data: { url: "https://stargate.finance" } });
            }
        }
    }

    console.log("Seeding completed.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
