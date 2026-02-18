
"use client";

import { useState } from "react";
import { CheckCircle, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TaskDetailDialog } from "./task-detail-dialog";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  type: string;
  url: string | null;
  content: string | null;
}

interface TaskListProps {
  tasks: Task[];
  airdropId: string;
}

export function TaskList({ tasks, airdropId }: TaskListProps) {
  const { user } = useUser();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // In a real app, fetch this from API/DB
  // For now, use local state or localStorage mock
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Function to mark verify logic
  const handleComplete = async (taskId: string) => {
    // 1. Optimistic Update
    const newcompleted = new Set(completedTaskIds);
    newcompleted.add(taskId);
    setCompletedTaskIds(newcompleted);
    
    // 2. API Call (TODO: Implement POST /api/tasks/[id]/verify)
    // try {
    //     await fetch(`/api/tasks/${taskId}/verify`, { method: "POST" });
    //     toast.success("Task verified!");
    // } catch (e) {
    //     toast.error("Failed to verify");
    //     // rollback local state
    // }
    
    toast.success("Task marked complete!");
    setSelectedTask(null);
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isCompleted = completedTaskIds.has(task.id);
        
        return (
          <Card 
            key={task.id} 
            className={cn(
                "transition-all cursor-pointer hover:border-primary/50 group",
                isCompleted ? "bg-muted/30 border-green-500/20" : "bg-card"
            )}
            onClick={() => setSelectedTask(task)}
          >
            <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isCompleted ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                )}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                    <h4 className={cn("font-medium", isCompleted && "text-muted-foreground line-through")}>
                        {task.title}
                    </h4>
                    {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description}
                        </p>
                    )}
                </div>

                <div className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">
                    +{task.points} PTS
                </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedTask && (
        <TaskDetailDialog 
            task={selectedTask}
            isOpen={!!selectedTask}
            onOpenChange={(open) => !open && setSelectedTask(null)}
            onComplete={handleComplete}
            isCompleted={completedTaskIds.has(selectedTask.id)}
        />
      )}
    </div>
  );
}
