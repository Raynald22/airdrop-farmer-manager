
import { mainnet, zkSync, scroll, base, linea, optimism, arbitrum, baseSepolia, scrollSepolia, lineaSepolia } from "wagmi/chains";

export interface ChainConfig {
    id: number;
    name: string;
    shortName: string;
    icon: string;
    color: string;
    explorerUrl: string;
    explorerApiUrl?: string;
    isTestnet?: boolean;
}

const PRODUCTION_CHAINS: ChainConfig[] = [
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

const TESTNET_CHAINS: ChainConfig[] = [
    {
        id: baseSepolia.id,
        name: "Base Sepolia",
        shortName: "Base Sep",
        icon: "🔵",
        color: "#0052FF",
        explorerUrl: "https://sepolia.basescan.org",
        explorerApiUrl: "https://api-sepolia.basescan.org/api",
        isTestnet: true,
    },
    {
        id: scrollSepolia.id,
        name: "Scroll Sepolia",
        shortName: "Scr Sep",
        icon: "📜",
        color: "#FFBE98",
        explorerUrl: "https://sepolia.scrollscan.com",
        explorerApiUrl: "https://api-sepolia.scrollscan.com/api",
        isTestnet: true,
    },
    {
        id: lineaSepolia.id,
        name: "Linea Sepolia",
        shortName: "Lin Sep",
        icon: "▬",
        color: "#61DFFF",
        explorerUrl: "https://sepolia.lineascan.build",
        explorerApiUrl: "https://api-sepolia.lineascan.build/api",
        isTestnet: true,
    },
];

// In Development, include Testnets.
export const SUPPORTED_CHAINS: ChainConfig[] =
    process.env.NODE_ENV === "development"
        ? [...PRODUCTION_CHAINS, ...TESTNET_CHAINS]
        : PRODUCTION_CHAINS;

export function getChainById(chainId: number): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find((c) => c.id === chainId);
}

export function getDefaultTrackingChains(): ChainConfig[] {
    // Default chains relevant for airdrop farming
    // If dev, include testnets for visibility
    const defaults: number[] = [zkSync.id, scroll.id, base.id, linea.id];
    if (process.env.NODE_ENV === "development") {
        defaults.push(baseSepolia.id, scrollSepolia.id, lineaSepolia.id);
    }

    return SUPPORTED_CHAINS.filter((c) => defaults.includes(c.id));
}
