import { mainnet, zkSync, scroll, base, linea, optimism, arbitrum } from "wagmi/chains";

export interface ChainConfig {
    id: number;
    name: string;
    shortName: string;
    icon: string;
    color: string;
    explorerUrl: string;
    explorerApiUrl?: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
    {
        id: mainnet.id,
        name: "Ethereum",
        shortName: "ETH",
        icon: "⟠",
        color: "#627EEA",
        explorerUrl: "https://etherscan.io",
        explorerApiUrl: "https://api.etherscan.io/api",
    },
    {
        id: zkSync.id,
        name: "zkSync Era",
        shortName: "zkSync",
        icon: "◆",
        color: "#8B8DFC",
        explorerUrl: "https://explorer.zksync.io",
        explorerApiUrl: "https://block-explorer-api.mainnet.zksync.io/api",
    },
    {
        id: scroll.id,
        name: "Scroll",
        shortName: "Scroll",
        icon: "📜",
        color: "#FFBE98",
        explorerUrl: "https://scrollscan.com",
        explorerApiUrl: "https://api.scrollscan.com/api",
    },
    {
        id: base.id,
        name: "Base",
        shortName: "Base",
        icon: "🔵",
        color: "#0052FF",
        explorerUrl: "https://basescan.org",
        explorerApiUrl: "https://api.basescan.org/api",
    },
    {
        id: linea.id,
        name: "Linea",
        shortName: "Linea",
        icon: "▬",
        color: "#61DFFF",
        explorerUrl: "https://lineascan.build",
        explorerApiUrl: "https://api.lineascan.build/api",
    },
    {
        id: optimism.id,
        name: "Optimism",
        shortName: "OP",
        icon: "🔴",
        color: "#FF0420",
        explorerUrl: "https://optimistic.etherscan.io",
        explorerApiUrl: "https://api-optimistic.etherscan.io/api",
    },
    {
        id: arbitrum.id,
        name: "Arbitrum",
        shortName: "ARB",
        icon: "🔷",
        color: "#28A0F0",
        explorerUrl: "https://arbiscan.io",
        explorerApiUrl: "https://api.arbiscan.io/api",
    },
];

export function getChainById(chainId: number): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getDefaultTrackingChains(): ChainConfig[] {
    // Default chains relevant for airdrop farming
    return SUPPORTED_CHAINS.filter((c) =>
        ([zkSync.id, scroll.id, base.id, linea.id] as number[]).includes(c.id)
    );
}
