
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, Globe, AlertTriangle } from "lucide-react";
import { TaskList } from "@/components/airdrop/task-list";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AirdropData {
  id: string;
  name: string;
  slug: string;
  description: string;
  chain: string;
  status: string;
  tasks: any[];
}

export default function AirdropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [airdrop, setAirdrop] = useState<AirdropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/airdrops/${slug}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error("Airdrop not found");
                throw new Error("Failed to load");
            }
            const data = await res.json();
            setAirdrop(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="h-8 w-1/3 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="space-y-4 pt-8">
                {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
        </div>
    );
  }

  if (error || !airdrop) {
      return (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <h2 className="text-xl font-bold">Error Loading Airdrop</h2>
              <p className="text-muted-foreground">{error || "Something went wrong."}</p>
              <Button onClick={() => router.push("/airdrops")}>Back to Airdrops</Button>
          </div>
      );
  }

  // Calculate progress (mock for now, TODO: use real completion data)
  const totalPoints = airdrop.tasks.reduce((sum, t) => sum + t.points, 0);
  const earnedPoints = 0; // TODO: Fetch user progress
  const progress = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-bold tracking-tight">{airdrop.name}</h1>
                    <Badge variant={airdrop.status === "active" ? "default" : "secondary"}>
                        {airdrop.status}
                    </Badge>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    {airdrop.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                        <Globe className="h-3.5 w-3.5" />
                        {airdrop.chain || "Multi-chain"}
                    </div>
                    {/* Add more stats if available */}
                </div>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content: Tasks */}
        <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Tasks ({airdrop.tasks.length})</h3>
                <span className="text-sm text-muted-foreground">
                    {earnedPoints} / {totalPoints} PTS
                </span>
            </div>
            
            <TaskList tasks={airdrop.tasks} airdropId={airdrop.id} />
        </div>

        {/* Sidebar: Progress & Info */}
        <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 space-y-4 sticky top-24">
                <h3 className="font-semibold">Your Progress</h3>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0% Complete</span>
                    <span>100% Complete</span>
                </div>
                <div className="pt-4 border-t">
                    <Button className="w-full" disabled>
                        Claim Airdrop (Coming Soon)
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
