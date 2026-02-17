import { Wallet, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  return (
    <Card className="glass border-border/30 hover:border-primary/30 transition-all duration-300 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium",
                  changeType === "positive" && "text-emerald-400",
                  changeType === "negative" && "text-red-400",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  totalWallets: number;
  totalBalance: string;
  activeWallets: number;
  warningCount: number;
}

export function StatsCards({ totalWallets, totalBalance, activeWallets, warningCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Wallets"
        value={totalWallets}
        change="Tracked across all chains"
        icon={<Wallet className="h-5 w-5" />}
      />
      <StatCard
        title="Portfolio Value"
        value={totalBalance}
        change="+2.4% from last week"
        changeType="positive"
        icon={<TrendingUp className="h-5 w-5" />}
      />
      <StatCard
        title="Active Wallets"
        value={activeWallets}
        change="Last 30 days"
        changeType="neutral"
        icon={<Activity className="h-5 w-5" />}
      />
      <StatCard
        title="Warnings"
        value={warningCount}
        change={warningCount > 0 ? "Action required" : "All clear"}
        changeType={warningCount > 0 ? "negative" : "positive"}
        icon={
            <Tooltip>
                <TooltipTrigger>
                    <AlertTriangle className="h-5 w-5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                    Wallets with Sybil risk factors. Check database for details.
                </TooltipContent>
            </Tooltip>
        }
      />
    </div>
  );
}
