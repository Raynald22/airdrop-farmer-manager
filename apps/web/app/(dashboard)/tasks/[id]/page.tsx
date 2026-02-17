"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TaskDetail {
    id: string;
    title: string;
    description: string | null;
    content: string | null;
    points: number;
    type: string;
    url: string | null;
    airdrop: {
        name: string;
        image: string | null;
        chain: string | null;
    };
    walletTasks: {
        id: string;
        status: string;
        completedAt: string | null;
        wallet: {
            id: string;
            address: string;
            label: string | null;
        };
    }[];
}

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [task, setTask] = useState<TaskDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTask() {
            try {
                const res = await fetch(`/api/tasks/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setTask(data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) fetchTask();
    }, [params.id]);

    if (loading) {
        return <div className="p-8"><div className="animate-pulse h-8 w-48 bg-accent/20 rounded"></div></div>;
    }

    if (!task) {
        return <div className="p-8">Task not found</div>;
    }

    const completedCount = task.walletTasks.filter(t => t.status === "completed").length;
    const totalWallets = task.walletTasks.length || 1; // avoid divide by zero if 0 wallets
    // Note: walletTasks only includes wallets that have interacted or are tracked. 
    // Ideally we want ALL user wallets. The API currently returns only created records.
    // Use dashboard wallet list context for better 'total' if needed, but for now this is fine.

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="glass border-border/30">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                                            {task.airdrop.name}
                                        </Badge>
                                        {task.type === "onchain_verify" && (
                                            <Badge variant="secondary" className="text-[10px]">On-chain</Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-2xl">{task.title}</CardTitle>
                                    <CardDescription>{task.description}</CardDescription>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant="secondary" className="font-mono">{task.points} PTS</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                           {task.url && (
                               <Button size="sm" variant="outline" className="w-full mb-6 gap-2" asChild>
                                   <a href={task.url} target="_blank" rel="noopener noreferrer">
                                       Go to Task <ExternalLink className="h-3.5 w-3.5" />
                                   </a>
                               </Button>
                           )}

                           <div className="prose prose-sm dark:prose-invert max-w-none">
                               {task.content ? (
                                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                       {task.content}
                                   </ReactMarkdown>
                               ) : (
                                   <p className="text-muted-foreground italic">No detailed guide available for this task.</p>
                               )}
                           </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Wallet Status */}
                <div className="space-y-6">
                    <Card className="glass border-border/30">
                        <CardHeader>
                            <CardTitle className="text-base">Wallet Progress</CardTitle>
                            <CardDescription>
                                {completedCount} completed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {task.walletTasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No wallet data available.</p>
                            ) : (
                                task.walletTasks.map(wt => (
                                    <div key={wt.id} className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-card/30">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">
                                                {wt.wallet.label || `${wt.wallet.address.slice(0,6)}...`}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono">
                                                {wt.wallet.address.slice(0,6)}...{wt.wallet.address.slice(-4)}
                                            </span>
                                        </div>
                                        {wt.status === "completed" ? (
                                            <div className="flex items-center text-green-500 text-xs font-medium gap-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>Done</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-muted-foreground text-xs gap-1">
                                                <Circle className="h-4 w-4" />
                                                <span>Pending</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
