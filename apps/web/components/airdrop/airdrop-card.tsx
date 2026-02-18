
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

interface AirdropProps {
  airdrop: {
    id: string;
    name: string;
    description: string | null;
    chain: string | null;
    status: string;
    slug: string;
    tasks: { id: string }[];
  };
}

export function AirdropCard({ airdrop }: AirdropProps) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant={airdrop.status === "active" ? "default" : "secondary"} className="mb-2">
            {airdrop.status}
          </Badge>
          <Badge variant="outline">{airdrop.chain}</Badge>
        </div>
        <CardTitle>{airdrop.name}</CardTitle>
        <CardDescription>{airdrop.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>{airdrop.tasks.length} Tasks</span>
          </div>
        </div>
        <Link href={`/airdrops/${airdrop.slug}`}>
          <Button className="w-full group">
            Start Farming
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
