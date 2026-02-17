
"use client";

import { useEffect, useState, use } from "react";
import { useWallets } from "@/hooks/use-wallets";
import { TaskList } from "@/components/airdrop/task-list";
import { BulkTaskUpdateDialog } from "@/components/airdrop/bulk-task-update-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface AirdropDetail {
  id: string;
  name: string;
  description: string | null;
  chain: string | null;
  status: string;
  slug: string;
  tasks: any[];
}

export default function AirdropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [airdrop, setAirdrop] = useState<AirdropDetail | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const { wallets, isLoading: walletsLoading } = useWallets();
  const [loading, setLoading] = useState(true);

  // Auto-select first wallet if available and none selected
  useEffect(() => {
    if (!walletsLoading && wallets.length > 0 && !selectedWalletId) {
      const firstWallet = wallets[0];
      if (firstWallet) setSelectedWalletId(firstWallet.id);
    }
  }, [wallets, walletsLoading, selectedWalletId]);

  useEffect(() => {
    async function fetchAirdrop() {
      try {
        // Since we don't have a single airdrop endpoint yet, we filter from all
        // In a real app, you'd want /api/airdrops/[id]
        const res = await fetch("/api/airdrops");
        const data = await res.json();
        const found = data.find((a: any) => a.id === resolvedParams.id);
        setAirdrop(found || null);
      } catch (error) {
        console.error("Failed to fetch airdrop details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAirdrop();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-32 w-full bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!airdrop) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold">Airdrop Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The airdrop you are looking for does not exist or has been removed.
        </p>
        <Link href="/airdrops" className="mt-4">
          <Button variant="outline">Back to Airdrops</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/airdrops"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Airdrops
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{airdrop.name}</h1>
              <Badge variant={airdrop.status === "active" ? "default" : "secondary"}>
                {airdrop.status}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{airdrop.description}</p>
          </div>
          
          {/* Wallet Selector */}
          <div className="w-full md:w-64">
             <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Farming Wallet
             </label>
             <Select
                value={selectedWalletId || undefined}
                onValueChange={setSelectedWalletId}
                disabled={walletsLoading}
             >
                <SelectTrigger>
                  <SelectValue placeholder={walletsLoading ? "Loading..." : "Select Wallet"} />
                </SelectTrigger>
                <SelectContent>
                  {wallets.map((wallet: any) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.label || wallet.address.slice(0, 6) + "..." + wallet.address.slice(-4)}
                    </SelectItem>
                  ))}
                  {wallets.length === 0 && !walletsLoading && (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                       No wallets found. <Link href="/wallets" className="underline">Add one?</Link>
                    </div>
                  )}
                </SelectContent>
             </Select>
          </div>

          
           {/* Bulk Actions */}
           <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block invisible">
                 Action
              </label>
              <BulkTaskUpdateDialog 
                tasks={airdrop.tasks} 
                wallets={wallets} 
                onSuccess={() => {
                   // Optional: refresh current wallet view if selected
                   if (selectedWalletId) {
                      // Trigger re-fetch logic if needed, or rely on optimistic UI in future updates
                      // For now, simple toast in dialog is enough feedback
                   }
                }}
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Task List */}
         <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Tasks</h2>
            <TaskList tasks={airdrop.tasks} walletId={selectedWalletId} />
         </div>

         {/* Sidebar Info */}
         <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 space-y-4">
               <h3 className="font-semibold">Info</h3>
               <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                     <span className="text-muted-foreground">Chain</span>
                     <span className="font-medium">{airdrop.chain}</span>
                  </div>
                   <div className="flex justify-between py-2 border-b border-border/50">
                     <span className="text-muted-foreground">Total Points</span>
                     <span className="font-medium">
                        {airdrop.tasks.reduce((sum: number, t: any) => sum + t.points, 0)}
                     </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                     <span className="text-muted-foreground">Type</span>
                     <span className="font-medium capitalize">{airdrop.slug.split("-")[0]}</span>
                  </div>
               </div>
               <Button variant="outline" className="w-full" asChild>
                  <a href={`https://google.com/search?q=${airdrop.name} airdrop guide`} target="_blank" rel="noopener noreferrer">
                     <ExternalLink className="mr-2 h-4 w-4" />
                     View Guide
                  </a>
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}
