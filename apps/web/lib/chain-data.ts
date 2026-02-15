import { createPublicClient, http, formatEther, type PublicClient, type Chain } from "viem";
import {
    mainnet,
    zksync,
    scroll,
    base,
    linea,
    arbitrum,
    optimism,
} from "viem/chains";

// Map chain IDs to viem chains
const CHAINS: Record<number, Chain> = {
    1: mainnet,
    324: zksync,
    534352: scroll,
    8453: base,
    59144: linea,
    42161: arbitrum,
    10: optimism,
};

export interface ChainStats {
    balance: string;
    txCount: number;
}

export class ChainDataService {
    private clients: Record<number, PublicClient>;

    constructor() {
        this.clients = {};
        Object.entries(CHAINS).forEach(([id, chain]) => {
            this.clients[Number(id)] = createPublicClient({
                chain,
                transport: http(),
            });
        });
    }

    async getStats(address: string, chainId: number): Promise<ChainStats> {
        const client = this.clients[chainId];
        if (!client) throw new Error(`Chain ${chainId} not configured`);

        const addr = address as `0x${string}`;

        const [balance, txCount] = await Promise.all([
            client.getBalance({ address: addr }),
            client.getTransactionCount({ address: addr }),
        ]);

        return {
            balance: formatEther(balance),
            txCount,
        };
    }

    async getAllStats(address: string) {
        const results = await Promise.allSettled(
            Object.keys(CHAINS).map(async (chainId) => {
                const id = Number(chainId);
                try {
                    const stats = await this.getStats(address, id);
                    return { chainId: id, ...stats };
                } catch (e) {
                    console.error(`Failed to fetch ${id}`, e);
                    return null;
                }
            })
        );

        return results
            .filter((r) => r.status === "fulfilled" && r.value !== null)
            .map((r) => (r as PromiseFulfilledResult<any>).value);
    }
}

export const chainDataService = new ChainDataService();
