import { createPublicClient, http, formatEther } from "viem";
import { mainnet, arbitrum, optimism, scroll, zksync, linea, base } from "viem/chains";

// EVM Clients
const clients: Record<number, any> = {
    1: createPublicClient({ chain: mainnet, transport: http() }),
    42161: createPublicClient({ chain: arbitrum, transport: http() }),
    10: createPublicClient({ chain: optimism, transport: http() }),
    534352: createPublicClient({ chain: scroll, transport: http() }),
    324: createPublicClient({ chain: zksync, transport: http() }),
    59144: createPublicClient({ chain: linea, transport: http() }),
    8453: createPublicClient({ chain: base, transport: http() }),
};

export const chainDataService = {
    async getAllStats(address: string, type: "EVM" | "SOL" | "BTC" = "EVM") {
        if (type === "BTC") {
            const stats = await fetchBtcBalance(address);
            return [{
                chainId: 0, // specialized ID for BTC
                name: "Bitcoin",
                balance: stats.balance,
                txCount: stats.txCount,
                nativeSymbol: "BTC"
            }];
        }

        if (type === "SOL") {
            const stats = await fetchSolBalance(address);
            return [{
                chainId: 999999, // specialized ID for SOL
                name: "Solana",
                balance: stats.balance,
                txCount: stats.txCount,
                nativeSymbol: "SOL"
            }];
        }

        // EVM logic (existing)
        const results = await Promise.all(
            Object.entries(clients).map(async ([chainId, client]) => {
                try {
                    const balance = await client.getBalance({ address: address as `0x${string}` });
                    const txCount = await client.getTransactionCount({ address: address as `0x${string}` });
                    return {
                        chainId: Number(chainId),
                        balance: formatEther(balance),
                        txCount,
                    };
                } catch (error) {
                    console.error(`Failed to fetch for chain ${chainId}`, error);
                    return null;
                }
            })
        );

        return results.filter(Boolean);
    },
};

interface ChainStats {
    balance: number;
    txCount: number;
}

async function fetchBtcBalance(address: string): Promise<ChainStats> {
    try {
        // Limited free tier: 200 req/hr. sufficient for dev/demo.
        // In prod, would need an API key or a better provider like Mempool.space
        const res = await fetch(`https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`);

        if (!res.ok) return { balance: 0, txCount: 0 };

        const data = await res.json();
        return {
            balance: data.final_balance / 100_000_000, // Satoshis to BTC
            txCount: data.n_tx,
        };
    } catch {
        return { balance: 0, txCount: 0 };
    }
}

async function fetchSolBalance(address: string): Promise<ChainStats> {
    try {
        // Solana RPC (Mainnet Beta) - rate limits apply
        const res = await fetch("https://api.mainnet-beta.solana.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [address]
            })
        });

        if (!res.ok) return { balance: 0, txCount: 0 };

        const data = await res.json();
        return {
            balance: (data.result?.value || 0) / 1_000_000_000, // Lamports to SOL
            txCount: 0, // RPC doesn't give tx count easily in one go
        };
    } catch {
        return { balance: 0, txCount: 0 };
    }
}
