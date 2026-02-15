"use client";

import { WalletInput } from "@/components/dashboard/wallet-input";
import { WalletTable } from "@/components/dashboard/wallet-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ChainActivityChart } from "@/components/dashboard/chain-activity-chart";
import { useWallets } from "@/hooks/use-wallets";

const FREE_TIER_MAX = 5;

export default function DashboardPage() {
  const { wallets, isLoading, addWallet, deleteWallet } = useWallets();

  const handleAddWallets = (newEntries: { address: string; label?: string }[]) => {
    // In a real app we'd batch this, but for now loop
    newEntries.forEach(entry => addWallet(entry));
  };

  const handleRemoveWallet = (id: string) => {
    deleteWallet(id);
  };

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
        totalBalance="—"
        activeWallets={wallets.length}
        warningCount={wallets.length > 0 ? Math.floor(wallets.length * 0.3) : 0}
      />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Table — takes 2 cols */}
        <div className="lg:col-span-2">
          <WalletTable wallets={wallets} onRemoveWallet={handleRemoveWallet} />
        </div>

        {/* Chart — takes 1 col */}
        <div>
          <ChainActivityChart walletCount={wallets.length} />
        </div>
      </div>
    </div>
  );
}
