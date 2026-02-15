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
import { Trash2, ExternalLink, Copy } from "lucide-react";
import { calculateScore, getStatusColor, getStatusEmoji, type WalletScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface TrackedWallet {
  id: string;
  address: string;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletTableProps {
  wallets: TrackedWallet[];
  onRemoveWallet: (id: string) => void;
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
      <span>{getStatusEmoji(score.status)}</span>
      <span>{score.overall}</span>
    </div>
  );
}

function WalletRow({ wallet, onRemove }: { wallet: TrackedWallet; onRemove: (id: string) => void }) {
  const addr = wallet.address as `0x${string}`;

  // Mock scoring for demo — in production this comes from backend
  const mockScore = calculateScore({
    txCount: Math.floor(Math.random() * 80),
    volumeUsd: Math.floor(Math.random() * 8000),
    uniqueContracts: Math.floor(Math.random() * 30),
    activeMonths: Math.floor(Math.random() * 6),
    bridgeVolumeUsd: Math.floor(Math.random() * 4000),
  });

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
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

export function WalletTable({ wallets, onRemoveWallet }: WalletTableProps) {
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
                <TableHead className="text-xs">Score</TableHead>
                <TableHead className="text-xs">◆ zkSync</TableHead>
                <TableHead className="text-xs">📜 Scroll</TableHead>
                <TableHead className="text-xs">🔵 Base</TableHead>
                <TableHead className="text-xs">▬ Linea</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wallets.map((wallet) => (
                <WalletRow key={wallet.id} wallet={wallet} onRemove={onRemoveWallet} />
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
