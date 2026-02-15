/**
 * Anti-Sybil Pattern Detection
 * 
 * Detects patterns that could flag wallets as sybil behavior:
 * - Similar transaction timing across wallets
 * - Identical funding sources
 * - Round-number transfers
 * - Low-diversity activity
 */

export type SybilRisk = "safe" | "low" | "medium" | "high" | "critical";

export interface SybilWarning {
    type: string;
    severity: SybilRisk;
    message: string;
    recommendation: string;
}

export interface SybilReport {
    overallRisk: SybilRisk;
    riskScore: number; // 0-100, lower is safer
    warnings: SybilWarning[];
}

interface WalletActivity {
    address: string;
    txCount: number;
    uniqueContracts: number;
    avgTimeBetweenTx: number; // hours
    hasBridged: boolean;
    fundingSource?: string;
    totalVolumeUsd: number;
    activeMonths: number;
    roundNumberTxPercent: number; // 0-100
}

export function detectSybilPatterns(wallets: WalletActivity[]): Map<string, SybilReport> {
    const reports = new Map<string, SybilReport>();

    for (const wallet of wallets) {
        const warnings: SybilWarning[] = [];

        // Check: Low contract diversity
        if (wallet.uniqueContracts < 3 && wallet.txCount > 10) {
            warnings.push({
                type: "LOW_DIVERSITY",
                severity: "medium",
                message: `Only ${wallet.uniqueContracts} unique contracts with ${wallet.txCount} transactions`,
                recommendation: "Interact with more unique protocols and contracts to appear organic.",
            });
        }

        // Check: Too regular timing
        if (wallet.avgTimeBetweenTx > 0 && wallet.avgTimeBetweenTx < 0.5 && wallet.txCount > 5) {
            warnings.push({
                type: "AUTOMATED_TIMING",
                severity: "high",
                message: "Transactions appear automated (avg < 30 min between txs)",
                recommendation: "Add randomization to transaction timing to avoid bot detection.",
            });
        }

        // Check: Round number transfers
        if (wallet.roundNumberTxPercent > 60) {
            warnings.push({
                type: "ROUND_NUMBERS",
                severity: "low",
                message: `${wallet.roundNumberTxPercent}% of transfers use round numbers`,
                recommendation: "Use varied amounts instead of round numbers like 0.1, 1.0, 10.0 ETH.",
            });
        }

        // Check: No bridge usage
        if (!wallet.hasBridged && wallet.txCount > 10) {
            warnings.push({
                type: "NO_BRIDGE",
                severity: "low",
                message: "No bridge transactions detected",
                recommendation: "Bridge funds between chains to demonstrate organic usage patterns.",
            });
        }

        // Check: Very low activity
        if (wallet.activeMonths < 2) {
            warnings.push({
                type: "NEW_WALLET",
                severity: "medium",
                message: `Active for only ${wallet.activeMonths} month(s)`,
                recommendation: "Maintain consistent activity over 3+ months for most airdrops.",
            });
        }

        // Check: Shared funding source
        const sharedFunding = wallets.filter(
            (w) => w.address !== wallet.address && w.fundingSource && w.fundingSource === wallet.fundingSource
        );
        if (sharedFunding.length > 0) {
            warnings.push({
                type: "SHARED_FUNDING",
                severity: "critical",
                message: `Shares funding source with ${sharedFunding.length} other tracked wallet(s)`,
                recommendation: "Use different initial funding sources for each wallet to avoid cluster detection.",
            });
        }

        // Calculate risk score
        const severityWeights: Record<SybilRisk, number> = {
            safe: 0, low: 10, medium: 25, high: 45, critical: 70,
        };
        const riskScore = Math.min(
            100,
            warnings.reduce((sum, w) => sum + severityWeights[w.severity], 0)
        );

        let overallRisk: SybilRisk;
        if (riskScore >= 70) overallRisk = "critical";
        else if (riskScore >= 45) overallRisk = "high";
        else if (riskScore >= 25) overallRisk = "medium";
        else if (riskScore >= 10) overallRisk = "low";
        else overallRisk = "safe";

        reports.set(wallet.address, { overallRisk, riskScore, warnings });
    }

    return reports;
}

export function getRiskColor(risk: SybilRisk): string {
    switch (risk) {
        case "safe": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
        case "low": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
        case "medium": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
        case "high": return "text-orange-400 bg-orange-400/10 border-orange-400/30";
        case "critical": return "text-red-400 bg-red-400/10 border-red-400/30";
    }
}

export function getRiskEmoji(risk: SybilRisk): string {
    switch (risk) {
        case "safe": return "🟢";
        case "low": return "🔵";
        case "medium": return "🟡";
        case "high": return "🟠";
        case "critical": return "🔴";
    }
}
