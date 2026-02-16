
"use client";

import { useEffect, useState } from "react";
import { WalletInput } from "@/components/dashboard/wallet-input";
import { WalletTable } from "@/components/dashboard/wallet-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChainActivityChart } from "@/components/dashboard/chain-activity-chart";
import { useWallets } from "@/hooks/use-wallets";

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your airdrop farming progress across multiple chains
          </p>
        </div>
        <WalletInput
          onAddWallets={handleAddWallets}
          currentCount={wallets.length}
          maxCount={FREE_TIER_MAX}
        />
      </div>

      {/* Stats */}
      <StatsCards
        totalWallets={wallets.length}
        totalBalance={`${totalBalance.toFixed(4)} ETH`}
        activeWallets={wallets.length} 
        warningCount={sybilRiskCount}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Table — takes 2 cols */}
        <div className="lg:col-span-2">
          <WalletTable 
            wallets={wallets} 
            onRemoveWallet={handleRemoveWallet} 
            onRefreshWallet={refreshWallet}
            isRefreshing={isRefreshing}
          />
        </div>

        {/* Chart — takes 1 col */}
        <div>
          <ChainActivityChart walletCount={wallets.length} />
        </div>
      </div>
    </div>
  );
}
