
import { Wallet, WalletStat } from "@prisma/client";
import { differenceInDays } from "date-fns";

export type ScoreStatus = "danger" | "warning" | "good" | "excellent";

export interface WalletScore {
    overall: number;
    status: ScoreStatus;
    breakdown: {
        txCount: { value: number; score: number; max: number };
        volume: { value: number; score: number; max: number };
        balance: { value: number; score: number; max: number };
        age: { value: number; score: number; max: number };
    };
}

// Scoring thresholds
const THRESHOLDS = {
    txCount: { min: 5, good: 50, excellent: 100, weight: 35 },
    volume: { min: 100, good: 1000, excellent: 10000, weight: 30 },
    balance: { min: 0.01, good: 0.1, excellent: 1.0, weight: 20 }, // Assuming ETH
    age: { min: 7, good: 30, excellent: 90, weight: 15 }, // Days
};

function scoreMetric(value: number, min: number, good: number, excellent: number): number {
    if (value <= 0) return 0;
    if (value >= excellent) return 100;
    if (value >= good) return 60 + ((value - good) / (excellent - good)) * 40;
    if (value >= min) return 20 + ((value - min) / (good - min)) * 40;
    return (value / min) * 20;
}

export function calculateWalletScore(wallet: Wallet & { stats: WalletStat[] }): WalletScore {
    // Aggregate stats across chains
    let totalTx = 0;
    let totalVolume = 0;
    let maxBalance = 0;

    for (const stat of wallet.stats) {
        totalTx += stat.txCount;
        totalVolume += stat.volumeUsd;
        // Approximation: take the max balance found across chains as "main" balance
        // Ideally we sum USD value, but balance is float. let's assume it's ETH/Native.
        maxBalance = Math.max(maxBalance, stat.balance);
    }

    const ageDays = differenceInDays(new Date(), new Date(wallet.createdAt));

    const txScore = scoreMetric(totalTx, THRESHOLDS.txCount.min, THRESHOLDS.txCount.good, THRESHOLDS.txCount.excellent);
    const volScore = scoreMetric(totalVolume, THRESHOLDS.volume.min, THRESHOLDS.volume.good, THRESHOLDS.volume.excellent);
    const balScore = scoreMetric(maxBalance, THRESHOLDS.balance.min, THRESHOLDS.balance.good, THRESHOLDS.balance.excellent);
    const ageScore = scoreMetric(ageDays, THRESHOLDS.age.min, THRESHOLDS.age.good, THRESHOLDS.age.excellent);

    const overall = Math.round(
        (txScore * THRESHOLDS.txCount.weight +
            volScore * THRESHOLDS.volume.weight +
            balScore * THRESHOLDS.balance.weight +
            ageScore * THRESHOLDS.age.weight) / 100
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
            txCount: { value: totalTx, score: Math.round(txScore), max: THRESHOLDS.txCount.excellent },
            volume: { value: totalVolume, score: Math.round(volScore), max: THRESHOLDS.volume.excellent },
            balance: { value: maxBalance, score: Math.round(balScore), max: THRESHOLDS.balance.excellent },
            age: { value: ageDays, score: Math.round(ageScore), max: THRESHOLDS.age.excellent },
        },
    };
}

export function getStatusColor(status: ScoreStatus): string {
    switch (status) {
        case "excellent": return "text-emerald-500";
        case "good": return "text-blue-500";
        case "warning": return "text-amber-500";
        case "danger": return "text-red-500";
    }
}
