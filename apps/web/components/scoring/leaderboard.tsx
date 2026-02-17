
"use client";

import { Wallet, WalletStat } from "@prisma/client";
import { WalletScore, calculateWalletScore, getStatusColor, ScoreStatus } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";

interface LeaderboardProps {
    wallets: (Wallet & { stats: WalletStat[] })[];
}

export function Leaderboard({ wallets }: LeaderboardProps) {
    // Calculate and sort scores
    const scoredWallets = wallets.map(w => ({
        ...w,
        scoreData: calculateWalletScore(w)
    })).sort((a, b) => b.scoreData.overall - a.scoreData.overall);

    const topWallet = scoredWallets[0];
    const avgScore = scoredWallets.reduce((acc, w) => acc + w.scoreData.overall, 0) / (scoredWallets.length || 1);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                        <Trophy className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold truncate">
                            {topWallet ? `${topWallet.label || topWallet.address.substring(0, 8)}...` : "N/A"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Score: {topWallet?.scoreData.overall || 0} / 100
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(avgScore)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {wallets.length} wallets
                        </p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Underperforming</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {scoredWallets.filter(w => w.scoreData.status === "danger").length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Wallets needing attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Wallet Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>Wallet</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Tx Count</TableHead>
                                <TableHead>Volume</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scoredWallets.map((wallet, index) => (
                                <TableRow key={wallet.id}>
                                    <TableCell className="font-medium">
                                        {index + 1}
                                        {index === 0 && " 👑"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{wallet.label || "Untitled"}</span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {wallet.address.substring(0, 10)}...
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold w-6">{wallet.scoreData.overall}</span>
                                            <Progress value={wallet.scoreData.overall} className="w-[60px] h-2" />
                                        </div>
                                    </TableCell>
                                    <TableCell>{wallet.scoreData.breakdown.txCount.value}</TableCell>
                                    <TableCell>${wallet.scoreData.breakdown.volume.value.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge 
                                            variant="outline" 
                                            className={`${getStatusColor(wallet.scoreData.status)} capitalize`}
                                        >
                                            {wallet.scoreData.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
