/**
 * Alert Engine
 * 
 * Rules-based alert system for wallet monitoring:
 * - Inactivity alerts
 * - Low balance warnings
 * - Gas price alerts
 * - Airdrop deadlines
 */

export type AlertType = "inactivity" | "low_balance" | "gas_price" | "deadline" | "sybil_risk" | "opportunity";
export type AlertPriority = "info" | "warning" | "critical";

export interface Alert {
    id: string;
    type: AlertType;
    priority: AlertPriority;
    title: string;
    message: string;
    walletAddress?: string;
    chainId?: number;
    createdAt: Date;
    read: boolean;
    actionUrl?: string;
}

interface AlertRule {
    type: AlertType;
    check: (context: AlertContext) => Alert | null;
}

interface AlertContext {
    walletAddress: string;
    lastActivityDate?: Date;
    balanceEth?: number;
    chainId?: number;
    sybilRiskScore?: number;
}

const INACTIVITY_THRESHOLD_DAYS = 30;
const LOW_BALANCE_THRESHOLD_ETH = 0.005;

export const alertRules: AlertRule[] = [
    {
        type: "inactivity",
        check: (ctx) => {
            if (!ctx.lastActivityDate) return null;
            const daysSince = Math.floor((Date.now() - ctx.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince >= INACTIVITY_THRESHOLD_DAYS) {
                return {
                    id: `inactivity-${ctx.walletAddress}-${Date.now()}`,
                    type: "inactivity",
                    priority: "warning",
                    title: "Wallet Inactive",
                    message: `Wallet ${ctx.walletAddress.slice(0, 6)}...${ctx.walletAddress.slice(-4)} has been idle for ${daysSince} days. Most airdrops require recent activity.`,
                    walletAddress: ctx.walletAddress,
                    createdAt: new Date(),
                    read: false,
                    actionUrl: `/wallets?address=${ctx.walletAddress}`,
                };
            }
            return null;
        },
    },
    {
        type: "low_balance",
        check: (ctx) => {
            if (ctx.balanceEth === undefined) return null;
            if (ctx.balanceEth < LOW_BALANCE_THRESHOLD_ETH) {
                return {
                    id: `low-balance-${ctx.walletAddress}-${ctx.chainId}-${Date.now()}`,
                    type: "low_balance",
                    priority: "critical",
                    title: "Low Gas Balance",
                    message: `Wallet ${ctx.walletAddress.slice(0, 6)}...${ctx.walletAddress.slice(-4)} has < ${LOW_BALANCE_THRESHOLD_ETH} ETH. Top up to continue farming.`,
                    walletAddress: ctx.walletAddress,
                    chainId: ctx.chainId,
                    createdAt: new Date(),
                    read: false,
                };
            }
            return null;
        },
    },
    {
        type: "sybil_risk",
        check: (ctx) => {
            if (ctx.sybilRiskScore === undefined) return null;
            if (ctx.sybilRiskScore >= 45) {
                return {
                    id: `sybil-${ctx.walletAddress}-${Date.now()}`,
                    type: "sybil_risk",
                    priority: "critical",
                    title: "Sybil Risk Detected",
                    message: `Wallet ${ctx.walletAddress.slice(0, 6)}...${ctx.walletAddress.slice(-4)} has a high sybil risk score (${ctx.sybilRiskScore}/100). Review activity patterns.`,
                    walletAddress: ctx.walletAddress,
                    createdAt: new Date(),
                    read: false,
                    actionUrl: `/sybil?address=${ctx.walletAddress}`,
                };
            }
            return null;
        },
    },
];

export function generateAlerts(contexts: AlertContext[]): Alert[] {
    const alerts: Alert[] = [];

    for (const ctx of contexts) {
        for (const rule of alertRules) {
            const alert = rule.check(ctx);
            if (alert) {
                alerts.push(alert);
            }
        }
    }

    return alerts.sort((a, b) => {
        const priorityOrder: Record<AlertPriority, number> = { critical: 0, warning: 1, info: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function getAlertIcon(type: AlertType): string {
    switch (type) {
        case "inactivity": return "💤";
        case "low_balance": return "⚠️";
        case "gas_price": return "⛽";
        case "deadline": return "⏰";
        case "sybil_risk": return "🛡️";
        case "opportunity": return "🎯";
    }
}

export function getAlertPriorityColor(priority: AlertPriority): string {
    switch (priority) {
        case "info": return "text-blue-400 bg-blue-400/10 border-blue-400/30";
        case "warning": return "text-amber-400 bg-amber-400/10 border-amber-400/30";
        case "critical": return "text-red-400 bg-red-400/10 border-red-400/30";
    }
}
