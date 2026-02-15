/**
 * @package @repo/shared
 * Shared types and utilities for the Airdrop Farmer Manager
 */

// ─── Wallet ──────────────────────────────────────────────

export interface Wallet {
    id: string;
    address: string;
    label?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Chain Stats ─────────────────────────────────────────

export interface ChainStats {
    chainId: number;
    chainName: string;
    balanceEth: number;
    txCount: number;
    volumeUsd: number;
    uniqueContracts: number;
    activeMonths: number;
    bridgeVolumeUsd: number;
    lastActivityDate?: Date;
}

export interface WalletStats {
    walletId: string;
    address: string;
    chains: ChainStats[];
    totalBalanceUsd: number;
    overallScore: number;
    sybilRiskScore: number;
    lastFetched: Date;
}

// ─── Airdrop Criteria ────────────────────────────────────

export interface AirdropCriteria {
    protocolName: string;
    chainId: number;
    minTxCount: number;
    minVolumeUsd: number;
    minUniqueContracts: number;
    minActiveMonths: number;
    requiresBridge: boolean;
    deadline?: Date;
}

// ─── Subscription ────────────────────────────────────────

export type SubscriptionTier = "free" | "pro" | "whale";

export interface UserSubscription {
    tier: SubscriptionTier;
    maxWallets: number;
    maxChains: number;
    hasSybilDetection: boolean;
    hasAlerts: boolean;
    hasApiAccess: boolean;
}

export const TIER_LIMITS: Record<SubscriptionTier, UserSubscription> = {
    free: {
        tier: "free",
        maxWallets: 5,
        maxChains: 2,
        hasSybilDetection: false,
        hasAlerts: false,
        hasApiAccess: false,
    },
    pro: {
        tier: "pro",
        maxWallets: 50,
        maxChains: 7,
        hasSybilDetection: true,
        hasAlerts: true,
        hasApiAccess: false,
    },
    whale: {
        tier: "whale",
        maxWallets: Infinity,
        maxChains: 7,
        hasSybilDetection: true,
        hasAlerts: true,
        hasApiAccess: true,
    },
};
