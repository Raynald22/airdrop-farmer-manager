
"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  type: string;
  url?: string;
}

interface TaskListProps {
  tasks: Task[];
  walletId: string | null;
}

export function TaskList({ tasks, walletId }: TaskListProps) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);

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
    if (!walletId || toggling || verifying) return;

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

  const handleVerify = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!walletId || verifying || toggling) return;
    
    setVerifying(taskId);
    try {
        const res = await fetch(`/api/tasks/${taskId}/verify`, {
            method: "POST",
            body: JSON.stringify({ walletId }),
        });
        
        const data = await res.json();
        
        if (data.verified) {
            setTaskStatuses((prev) => ({
                ...prev,
                [taskId]: "completed",
            }));
            toast.success("Verification successful! Task completed.");
        } else {
            toast.error("Verification failed. Check if you completed the task on-chain.");
        }
    } catch (error) {
        console.error("Verification error", error);
        toast.error("Something went wrong during verification.");
    } finally {
        setVerifying(null);
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
        const isVerifying = verifying === task.id;

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
                  <Link href={`/tasks/${task.id}`} className="hover:underline hover:text-primary transition-colors">
                    {task.title}
                  </Link>
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={isCompleted ? "default" : "outline"} className="ml-2">
                    {task.points} PTS
                  </Badge>
                   {task.url && (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Go ↗
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
              
              {/* Verification UI */}
              {task.type === "onchain_verify" && !isCompleted && (
                <div className="mt-3 flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-7 text-xs gap-1"
                    onClick={(e) => handleVerify(e, task.id)}
                    disabled={isVerifying}
                  >
                     {isVerifying ? <Loader2 className="h-3 w-3 animate-spin"/> : <RefreshCw className="h-3 w-3" />}
                     {isVerifying ? "Verifying..." : "Verify On-Chain"}
                  </Button>
                  <span className="text-[10px] text-muted-foreground">
                    Checks blockchain automatically
                  </span>
                </div>
              )}
              
              {task.type === "onchain_verify" && isCompleted && (
                <div className="mt-2">
                   <Badge variant="secondary" className="text-[10px] uppercase bg-green-100 text-green-800 border-green-200">
                     Verified On-Chain
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
