"use client";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBalance } from "wagmi";
import { formatEther } from "viem";
import { zkSync, scroll, base, linea } from "wagmi/chains";
import { Trash2, ExternalLink, Copy, RefreshCw } from "lucide-react";
import { calculateWalletScore, getStatusColor, type WalletScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { ChainIcon } from "@/components/ui/chain-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TrackedWallet {
  id: string;
  address: string;
  label?: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletTableProps {
  wallets: TrackedWallet[];
  onRemoveWallet: (id: string) => void;
  onRefreshWallet: (id: string) => void;
  isRefreshing?: boolean;
}


function ChainBalance({ address, chainId, symbol }: { address: `0x${string}`; chainId: number; symbol: string }) {
  const { data, isLoading } = useBalance({ address, chainId });

  if (isLoading) return <span className="text-muted-foreground text-xs">...</span>;
  if (!data) return <span className="text-muted-foreground text-xs">0.0000</span>;

  const val = parseFloat(formatEther(data.value));
  return (
    <span className={cn("text-xs font-mono", val > 0 ? "text-foreground" : "text-muted-foreground")}>
      {val.toFixed(4)}
    </span>
  );
}

function ScoreBadge({ score }: { score: WalletScore }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border", getStatusColor(score.status))}>
      <span>{score.status === 'excellent' ? '🦄' : score.status === 'good' ? '🐋' : score.status === 'warning' ? '🐬' : '🐟'}</span>
      <span>{score.overall}</span>
    </div>
  );
}

function WalletNotes({ wallet, onUpdate }: { wallet: TrackedWallet; onUpdate: () => void }) {
  const [notes, setNotes] = useState(wallet.notes || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/wallets/${wallet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) throw new Error("Failed to save notes");

      toast.success("Notes saved");
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="group flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <StickyNote className={cn("h-3.5 w-3.5", wallet.notes ? "text-primary fill-primary/10" : "opacity-0 group-hover:opacity-100 transition-opacity")} />
          <span className="text-xs max-w-[100px] truncate hidden sm:block">
            {wallet.notes || <span className="opacity-0 group-hover:opacity-50 italic">Add note...</span>}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Wallet Notes</h4>
            <p className="text-sm text-muted-foreground">
              Add reminders or details for this wallet.
            </p>
          </div>
          <div className="grid gap-2">
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Main burner, deployed on Scroll..."
              className="h-24 resize-none"
            />
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function WalletRow({ wallet, onRemove, onRefresh, onUpdate, isRefreshing }: { 
  wallet: TrackedWallet; 
  onRemove: (id: string) => void;
  onRefresh: (id: string) => void;
  onUpdate: (id: string) => void;
  isRefreshing?: boolean;
}) {
  const addr = wallet.address as `0x${string}`;

  // Mock scoring for demo
  const mockStats = {
    id: "mock",
    walletId: wallet.id,
    chainId: 1,
    txCount: Math.floor(Math.random() * 100),
    volumeUsd: Math.floor(Math.random() * 10000),
    balance: Math.random() * 2,
    fetchedAt: new Date()
  };

  // We cast to any because we are mocking the input
  const mockScore = calculateWalletScore({ 
      ...wallet, 
      stats: [mockStats] 
  } as any);

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success("Address copied");
  };

  return (
    <TableRow className="hover:bg-accent/30 transition-colors group">
      {/* Address */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {wallet.label?.charAt(0) || "#"}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs">
                {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </span>
              <button onClick={copyAddress} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground">{wallet.label || "Unlabeled"}</span>
          </div>
        </div>
      </TableCell>
      
      {/* Notes (New Column) */}
      <TableCell>
        <WalletNotes wallet={wallet} onUpdate={() => onUpdate(wallet.id)} />
      </TableCell>

      {/* Score */}
      <TableCell>
        <ScoreBadge score={mockScore} />
      </TableCell>

      {/* Chain Balances */}
      <TableCell><ChainBalance address={addr} chainId={zkSync.id} symbol="ETH" /></TableCell>
      <TableCell><ChainBalance address={addr} chainId={scroll.id} symbol="ETH" /></TableCell>
      <TableCell><ChainBalance address={addr} chainId={base.id} symbol="ETH" /></TableCell>
      <TableCell><ChainBalance address={addr} chainId={linea.id} symbol="ETH" /></TableCell>

      {/* Actions */}
      <TableCell>
        <div className="flex items-center gap-1 justify-end">
           <button
            onClick={() => onRefresh(wallet.id)}
            className="p-1.5 rounded-md hover:bg-accent/50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground hover:text-primary", isRefreshing && "animate-spin")} />
          </button>
          <a
            href={`https://debank.com/profile/${wallet.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-accent/50 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </a>
          <button
            onClick={() => onRemove(wallet.id)}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-400" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function WalletTable({ wallets, onRemoveWallet, onRefreshWallet, isRefreshing }: WalletTableProps) {
  // Simple hack to refresh: In a real app, use SWR/Tanstack Query mutation
  // Here we just rely on parent re-fetching or optimistic updates. 
  // For now, we pass a dummy update handler that refreshes the whole list via parent if possible,
  // or just assumes optimistic update at row level (though refreshing is better).
  // Actually, let's just use the refreshWallet function to trigger a re-fetch of that specific wallet if possible,
  // or we need a way to tell parent to reload.
  // For MVP, we'll reuse onRefreshWallet which triggers useWallets refresh logic.
  
  const handleUpdate = (id: string) => {
      onRefreshWallet(id); 
  };

  if (wallets.length === 0) {
    return (
      <Card className="glass border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No wallets tracked yet</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Click &ldquo;Add Wallets&rdquo; above to start tracking your portfolio across multiple chains.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tracked Wallets ({wallets.length})</CardTitle>
          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
            Free: {wallets.length}/5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/30">
                <TableHead className="text-xs w-[200px]">Wallet</TableHead>
                <TableHead className="text-xs w-[150px]">Notes</TableHead>
                <TableHead className="text-xs">
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 cursor-help">
                      Score <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>Sybil risk score (Lower is better)</TooltipContent>
                  </Tooltip>
                </TableHead>
                <TableHead className="text-xs">
                  <div className="flex items-center gap-1.5"><ChainIcon name="zksync" className="h-4 w-4" /> zkSync</div>
                </TableHead>
                <TableHead className="text-xs">
                  <div className="flex items-center gap-1.5"><ChainIcon name="scroll" className="h-4 w-4" /> Scroll</div>
                </TableHead>
                <TableHead className="text-xs">
                  <div className="flex items-center gap-1.5"><ChainIcon name="base" className="h-4 w-4" /> Base</div>
                </TableHead>
                <TableHead className="text-xs">
                  <div className="flex items-center gap-1.5"><ChainIcon name="linea" className="h-4 w-4" /> Linea</div>
                </TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <WalletRow 
                  key={wallet.id} 
                  wallet={wallet} 
                  onRemove={onRemoveWallet} 
                  onRefresh={onRefreshWallet}
                  onUpdate={handleUpdate}
                  isRefreshing={isRefreshing}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
