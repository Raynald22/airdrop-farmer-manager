"use client";

import { Plus, Wallet, ShieldCheck, Activity, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WalletInput } from "@/components/dashboard/wallet-input";
import { WalletTable } from "@/components/dashboard/wallet-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChainActivityChart } from "@/components/dashboard/chain-activity-chart";
import { useWallets } from "@/hooks/use-wallets";
import { GettingStarted } from "@/components/dashboard/getting-started";
import { GasTracker } from "@/components/dashboard/gas-tracker";
import { RecentActivity } from "@/components/dashboard/recent-activity";
const FREE_TIER_MAX = 5;

export default function DashboardPage() {
  const { wallets, isLoading, addWallet, deleteWallet, refreshWallet, isRefreshing } = useWallets();
  const [sybilRiskCount, setSybilRiskCount] = useState(0);

  // Fetch Sybil stats
  useEffect(() => {
    async function fetchSybil() {
        try {
            // We could create a dedicated stats endpoint, but for now reuse analyze
            // Optimization: In prod, make a lightweight "summary" endpoint
            const res = await fetch("/api/sybil/analyze");
            if (res.ok) {
                const data = await res.json();
                const atRisk = Object.values(data).filter(
                    (r: any) => r.overallRisk !== "safe" && r.overallRisk !== "low"
                ).length;
                setSybilRiskCount(atRisk);
            }
        } catch (e) {
            console.error("Failed to fetch sybil stats", e);
        }
    }
    fetchSybil();
  }, [wallets.length]); // Refresh when wallets change

  const handleAddWallets = (newEntries: { address: string; label?: string; type: "EVM" | "SOL" | "BTC" }[]) => {
    newEntries.forEach(entry => addWallet(entry));
  };

  const handleRemoveWallet = (id: string) => {
    deleteWallet(id);
  };

  // Calculate stats
  const totalBalance = wallets.reduce((sum, w: any) => {
      const walletBalance = w.stats?.reduce((s: number, stat: any) => s + (stat.balance || 0), 0) || 0;
      return sum + walletBalance;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 w-full bg-accent/20 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
             <div key={i} className="h-32 bg-accent/20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Calculate chain stats for chart
  const chainStats: Record<string, number> = {
    "zkSync": 0, "Scroll": 0, "Base": 0, "Linea": 0, "Unknown": 0
  };

  wallets.forEach((w: any) => {
    if (w.stats) {
      w.stats.forEach((s: any) => {
        if (s.chainId === 324) chainStats["zkSync"] += s.txCount;
        else if (s.chainId === 534352) chainStats["Scroll"] += s.txCount;
        else if (s.chainId === 8453) chainStats["Base"] += s.txCount;
        else if (s.chainId === 59144) chainStats["Linea"] += s.txCount;
        else chainStats["Unknown"] += s.txCount;
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
             <GasTracker />
          </div>
          <p className="text-sm text-muted-foreground">
            Track your airdrop farming progress across multiple chains
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <a href="/api/wallets/export" download>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </a>
            </Button>
            <Button 
                variant="default" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={async () => {
                    const toastId = toast.loading("🤖 Bot is starting...");
                    try {
                        const res = await fetch("/api/farm", { method: "POST" });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || "Failed");
                        toast.success(`Bot finished! Processed ${data.results?.length} wallets.`, { id: toastId });
                    } catch (e: any) {
                        toast.error(`Bot failed: ${e.message}`, { id: toastId });
                    }
                }}
            >
                <Activity className="mr-2 h-4 w-4" />
                Run Bot
            </Button>
            <WalletInput
              onAddWallets={handleAddWallets}
              currentCount={wallets.length}
              maxCount={FREE_TIER_MAX}
            />
        </div>
      </div>

      {/* Getting Started Guide */}
      <GettingStarted />

      {/* Stats */}
      <StatsCards
        totalWallets={wallets.length}
        totalBalance={`${totalBalance.toFixed(4)} ETH`}
        activeWallets={wallets.length} 
        warningCount={sybilRiskCount}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (Table + Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <WalletTable 
            wallets={wallets} 
            onRemoveWallet={handleRemoveWallet} 
            onRefreshWallet={refreshWallet}
            isRefreshing={isRefreshing}
          />
          <ChainActivityChart walletCount={wallets.length} stats={chainStats} />
        </div>

        {/* Sidebar (Activity Feed) */}
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
