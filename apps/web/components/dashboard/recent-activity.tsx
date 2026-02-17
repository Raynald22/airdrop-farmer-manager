"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Wallet, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityItem {
  type: "task_completed" | "wallet_added";
  id: string;
  timestamp: string;
  wallet: string;
  details: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <Card className="glass border-border/30 h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Activity</CardTitle>
        <button onClick={fetchActivity} className="text-muted-foreground hover:text-primary">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-[300px] lg:h-full px-6 pb-6">
        <div className="space-y-6">
          {activities.length === 0 && !loading ? (
             <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
             activities.map((item, i) => (
                <div key={`${item.id}-${i}`} className="flex gap-4">
                  <div className="mt-1 relative">
                    <div className="absolute top-4 left-1.5 bottom-[-24px] w-px bg-border last:hidden" />
                    <div className={`
                        h-3 w-3 rounded-full border-2 ring-4 ring-background
                        ${item.type === 'task_completed' ? 'border-green-500 bg-green-500' : 'border-blue-500 bg-blue-500'}
                    `} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">
                      {item.type === "task_completed" ? "Task Completed" : "New Wallet Added"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono text-primary">{item.wallet}</span> • {item.details}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
