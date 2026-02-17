
"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function Notifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Poll for alerts every 30s
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts);
    } catch (e) {
      console.error("Failed to fetch alerts", e);
    }
  }

  async function markAsRead(id: string) {
    try {
      // Optimistic update
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
      
      await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    } catch (e) {
      console.error(e);
      fetchAlerts(); // Revert on error
    }
  }

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-accent/50 transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <a href="/activity" className="text-xs text-primary hover:underline">
            View All
          </a>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer group",
                  !alert.read && "bg-primary/5"
                )}
                onClick={() => !alert.read && markAsRead(alert.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-none",
                        !alert.read && "text-primary"
                      )}
                    >
                      {alert.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70">
                        {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!alert.read && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
