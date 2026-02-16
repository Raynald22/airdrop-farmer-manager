
"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  type: string;
}

interface TaskListProps {
  tasks: Task[];
  walletId: string | null;
}

export function TaskList({ tasks, walletId }: TaskListProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!walletId) {
      setTaskStatuses({});
      return;
    }

    async function fetchTaskStatuses() {
      setLoading(true);
      try {
        const res = await fetch(`/api/wallets/${walletId}/tasks`);
        if (res.ok) {
          const data = await res.json();
          setTaskStatuses(data);
        }
      } catch (error) {
        console.error("Failed to fetch task statuses", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTaskStatuses();
  }, [walletId]);

  const handleToggle = async (taskId: string, currentStatus: string) => {
    if (!walletId || toggling) return;

    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    setToggling(taskId);

    // Optimistic update
    setTaskStatuses((prev) => ({
      ...prev,
      [taskId]: newStatus,
    }));

    try {
      await fetch(`/api/wallets/${walletId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ taskId, status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update task", error);
      // Revert on error
      setTaskStatuses((prev) => ({
        ...prev,
        [taskId]: currentStatus,
      }));
    } finally {
      setToggling(null);
    }
  };

  if (!walletId) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">Select a wallet to track progress</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => {
        const isCompleted = taskStatuses[task.id] === "completed";
        const isProcessing = toggling === task.id;

        return (
          <div
            key={task.id}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/50",
              isCompleted ? "bg-primary/5 border-primary/20" : "bg-card"
            )}
            onClick={() => handleToggle(task.id, taskStatuses[task.id] || "pending")}
          >
            <div className="mt-1">
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-colors",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {isCompleted && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-medium",
                    isCompleted && "text-muted-foreground line-through decoration-primary/50"
                  )}
                >
                  {task.title}
                </span>
                <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">
                  {task.points} PTS
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              {task.type === "onchain_verify" && (
                <div className="mt-2">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    On-chain Verify
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
