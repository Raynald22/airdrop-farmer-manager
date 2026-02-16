
"use client";

import { useEffect, useState } from "react";
import { type SybilReport, type SybilWarning, getRiskColor, getRiskEmoji } from "@/lib/sybil-detector";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";

export default function SybilPage() {
  const [reports, setReports] = useState<Record<string, SybilReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        const res = await fetch("/api/sybil/analyze");
        if (!res.ok) throw new Error("Failed to fetch analysis");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analysis. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, []);

  const reportEntries = Object.entries(reports);
  const avgScore = reportEntries.length > 0 
    ? Math.round(reportEntries.reduce((sum, [_, r]) => sum + r.riskScore, 0) / reportEntries.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-1/3 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Analysis Failed</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (reportEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4">
        <ShieldCheck className="h-16 w-16 text-muted-foreground/20" />
        <div>
          <h2 className="text-xl font-bold">No Wallets to Analyze</h2>
          <p className="text-muted-foreground">Add wallets to start checking for sybil risks.</p>
        </div>
        <Link href="/wallets">
           <Button>Add Wallet</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sybil Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered detection of common sybil patterns across your cluster.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-lg border">
            <span className="text-sm font-medium text-muted-foreground">Cluster Health</span>
            <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{100 - avgScore}%</span>
                <Badge variant={avgScore < 20 ? "default" : "destructive"}>
                    {avgScore < 20 ? "Healthy" : "At Risk"}
                </Badge>
            </div>
        </div>
      </div>

      {/* Grid of Results */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportEntries.map(([address, report]) => (
          <Card key={address} className={`border-t-4 ${getBorderColor(report.overallRisk)}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="font-mono text-xs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
                <span className="text-2xl" role="img" aria-label="risk">
                    {getRiskEmoji(report.overallRisk)}
                </span>
              </div>
              <CardTitle className="flex items-baseline gap-2 mt-2">
                Risk Score: {report.riskScore}
                <span className="text-sm font-normal text-muted-foreground">/ 100</span>
              </CardTitle>
              <CardDescription className="capitalize">
                {report.overallRisk} Risk Level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mt-2">
                {report.warnings.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-500/10 p-2 rounded">
                    <ShieldCheck className="h-4 w-4" />
                    <span>No specific patterns detected.</span>
                  </div>
                ) : (
                  report.warnings.map((w, idx) => (
                    <div key={idx} className="bg-muted/50 p-2.5 rounded-lg text-sm space-y-1">
                      <div className="flex items-center gap-2 font-medium text-xs uppercase tracking-wide text-muted-foreground">
                        <AlertTriangle className="h-3 w-3" />
                        {w.type.replace("_", " ")}
                      </div>
                      <p className="text-foreground/90">{w.message}</p>
                      <p className="text-xs text-muted-foreground italic">
                        Tip: {w.recommendation}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getBorderColor(risk: string) {
    switch (risk) {
        case "safe": return "border-t-emerald-500";
        case "low": return "border-t-blue-500";
        case "medium": return "border-t-amber-500";
        case "high": return "border-t-orange-500";
        case "critical": return "border-t-red-500";
        default: return "border-t-border";
    }
}
