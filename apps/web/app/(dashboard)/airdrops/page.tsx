
"use client";

import { useEffect, useState, useCallback } from "react";
import { AirdropCard } from "@/components/airdrop/airdrop-card";
import { CreateAirdropDialog } from "@/components/airdrop/create-airdrop-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Airdrop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  chain: string | null;
  status: string;
  tasks: { id: string }[];
}

export default function AirdropsPage() {
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAirdrops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/airdrops");
      const data = await res.json();
      setAirdrops(data);
    } catch (error) {
      console.error("Failed to fetch airdrops", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAirdrops();
  }, [fetchAirdrops]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Active Airdrops</h1>
          <p className="text-muted-foreground">
            Curated list of high-potential airdrops with step-by-step tasks.
          </p>
        </div>
        <CreateAirdropDialog onSuccess={fetchAirdrops} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? [...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4 border rounded-xl p-6">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
              </div>
            ))
          : airdrops.map((airdrop) => (
              <AirdropCard key={airdrop.id} airdrop={airdrop} />
            ))}
            
        {!loading && airdrops.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No airdrops found. Create one to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}
