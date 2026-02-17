
"use client";

import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function SubscriptionStatus() {
  const { user, isLoaded } = useUser();
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTier() {
      if (!user) return;
      try {
        const res = await fetch("/api/user/tier");
        if (res.ok) {
          const data = await res.json();
          setTier(data.tier);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && user) {
      fetchTier();
    }
  }, [isLoaded, user]);

  if (!isLoaded || loading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const isWhale = tier === "whale";
  const isPro = tier === "pro";
  const isFree = !tier || tier === "free";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Current Plan</span>
          <Badge variant={isWhale ? "default" : isPro ? "secondary" : "outline"}>
            {isWhale ? "Whale 🐋" : isPro ? "Pro ⚡" : "Free 🌱"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {isWhale 
            ? "You have full access to all features and automation." 
            : isPro 
            ? "Advanced tracking enabled. Upgrade to Whale for automation." 
            : "Limited features. Upgrade to unlock more power."
          }
        </p>
      </div>
      {!isWhale && (
        <Button asChild variant="default">
          <Link href="/pricing">
             {isPro ? "Upgrade to Whale" : "Upgrade to Pro"}
          </Link>
        </Button>
      )}
      {isWhale && (
        <Button variant="outline" disabled>
            Plan Active
        </Button>
      )}
    </div>
  );
}
