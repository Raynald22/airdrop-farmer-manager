/**
 * Airdrop Eligibility Scoring Engine
 * 
 * Scores wallets based on common airdrop criteria:
 * - Transaction count
 * - Volume (USD)
 * - Unique contracts interacted
 * - Active months
 * - Bridge usage
 * 
 * Returns a score from 0-100 and a status (danger/warning/good/excellent)
 */

export type ScoreStatus = "danger" | "warning" | "good" | "excellent";

export interface WalletScore {
    overall: number;
    status: ScoreStatus;
    breakdown: {
        txCount: { value: number; score: number; max: number };
        volume: { value: number; score: number; max: number };
        contracts: { value: number; score: number; max: number };
        activeMonths: { value: number; score: number; max: number };
        bridgeVolume: { value: number; score: number; max: number };
    };
}

interface ScoringInput {
    txCount: number;
    volumeUsd: number;
    uniqueContracts: number;
    activeMonths: number;
    bridgeVolumeUsd: number;
}

// Scoring thresholds based on common airdrop criteria
const THRESHOLDS = {
    txCount: { min: 5, good: 25, excellent: 100, weight: 25 },
    volume: { min: 100, good: 1000, excellent: 10000, weight: 25 },
    contracts: { min: 2, good: 10, excellent: 50, weight: 20 },
    activeMonths: { min: 1, good: 3, excellent: 6, weight: 15 },
    bridgeVolume: { min: 50, good: 500, excellent: 5000, weight: 15 },
};

function scoreMetric(value: number, min: number, good: number, excellent: number): number {
    if (value <= 0) return 0;
    if (value >= excellent) return 100;
    if (value >= good) return 60 + ((value - good) / (excellent - good)) * 40;
    if (value >= min) return 20 + ((value - min) / (good - min)) * 40;
    return (value / min) * 20;
}

export function calculateScore(input: ScoringInput): WalletScore {
    const txScore = scoreMetric(input.txCount, THRESHOLDS.txCount.min, THRESHOLDS.txCount.good, THRESHOLDS.txCount.excellent);
    const volScore = scoreMetric(input.volumeUsd, THRESHOLDS.volume.min, THRESHOLDS.volume.good, THRESHOLDS.volume.excellent);
    const contractScore = scoreMetric(input.uniqueContracts, THRESHOLDS.contracts.min, THRESHOLDS.contracts.good, THRESHOLDS.contracts.excellent);
    const monthScore = scoreMetric(input.activeMonths, THRESHOLDS.activeMonths.min, THRESHOLDS.activeMonths.good, THRESHOLDS.activeMonths.excellent);
    const bridgeScore = scoreMetric(input.bridgeVolumeUsd, THRESHOLDS.bridgeVolume.min, THRESHOLDS.bridgeVolume.good, THRESHOLDS.bridgeVolume.excellent);

    const overall = Math.round(
        (txScore * THRESHOLDS.txCount.weight +
            volScore * THRESHOLDS.volume.weight +
            contractScore * THRESHOLDS.contracts.weight +
            monthScore * THRESHOLDS.activeMonths.weight +
            bridgeScore * THRESHOLDS.bridgeVolume.weight) / 100
    );

    let status: ScoreStatus;
    if (overall >= 75) status = "excellent";
    else if (overall >= 50) status = "good";
    else if (overall >= 25) status = "warning";
    else status = "danger";

    return {
        overall,
        status,
        breakdown: {
            txCount: { value: input.txCount, score: Math.round(txScore), max: THRESHOLDS.txCount.excellent },
            volume: { value: input.volumeUsd, score: Math.round(volScore), max: THRESHOLDS.volume.excellent },
            contracts: { value: input.uniqueContracts, score: Math.round(contractScore), max: THRESHOLDS.contracts.excellent },
            activeMonths: { value: input.activeMonths, score: Math.round(monthScore), max: THRESHOLDS.activeMonths.excellent },
            bridgeVolume: { value: input.bridgeVolumeUsd, score: Math.round(bridgeScore), max: THRESHOLDS.bridgeVolume.excellent },
        },
    };
}

export function getStatusColor(status: ScoreStatus): string {
    switch (status) {
        case "excellent": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
        case "good": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
        case "warning": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
        case "danger": return "text-red-400 bg-red-400/10 border-red-400/30";
    }
}

export function getStatusEmoji(status: ScoreStatus): string {
    switch (status) {
        case "excellent": return "🟢";
        case "good": return "🔵";
        case "warning": return "🟡";
        case "danger": return "🔴";
    }
}
