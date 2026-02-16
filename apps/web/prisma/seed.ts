
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
                    },
                    {
                        title: "Swap on Ambient",
                        description: "Perform a swap on Ambient Finance.",
                        points: 50,
                        type: "manual",
                    },
                    {
                        title: "Deploy a Contract",
                        description: "Deploy any smart contract on Scroll.",
                        points: 200,
                        type: "onchain_verify",
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
                    },
                    {
                        title: "Bridge via Stargate",
                        description: "Bridge USDC to Linea using Stargate.",
                        points: 80,
                        type: "manual",
                    },
                ],
            },
        },
    });

    console.log({ scroll, linea });
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
