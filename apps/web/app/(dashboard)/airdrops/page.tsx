
"use client";

import { useEffect, useState } from "react";
import { AirdropCard } from "@/components/airdrop/airdrop-card";
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

  useEffect(() => {
    async function fetchAirdrops() {
      try {
        const res = await fetch("/api/airdrops");
        const data = await res.json();
        setAirdrops(data);
      } catch (error) {
        console.error("Failed to fetch airdrops", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAirdrops();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Active Airdrops</h1>
        <p className="text-muted-foreground">
          Curated list of high-potential airdrops with step-by-step tasks.
        </p>
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
      </div>
    </div>
  );
}
