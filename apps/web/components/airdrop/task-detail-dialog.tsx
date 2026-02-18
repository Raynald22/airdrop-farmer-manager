
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ExternalLink, BookOpen, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string | null;
  points: number;
  type: string;
  url: string | null;
  content: string | null;
}

interface TaskDetailDialogProps {
  task: Task;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (taskId: string) => void;
  isCompleted?: boolean;
}

export function TaskDetailDialog({ task, isOpen, onOpenChange, onComplete, isCompleted }: TaskDetailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono uppercase">
                    {task.type}
                </Badge>
                {isCompleted && (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Completed
                    </Badge>
                )}
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                +{task.points} PTS
            </div>
          </div>
          <div>
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            <DialogDescription className="text-base mt-2">
                {task.description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 my-4 space-y-4">
            {/* Guide Content */}
            {task.content ? (
                <div className="prose prose-sm dark:prose-invert max-w-none bg-muted/30 p-4 rounded-lg border border-border/50">
                    <ReactMarkdown>{task.content}</ReactMarkdown>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <BookOpen className="h-8 w-8 mb-2 opacity-50" />
                    <p>No guide needed for this task. Just follow the instructions.</p>
                </div>
            )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t mt-auto">
            {task.url && (
                <Button variant="outline" asChild className="w-full sm:w-auto">
                    <a href={task.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Go to Project
                    </a>
                </Button>
            )}
            <Button 
                onClick={() => {
                    onComplete(task.id);
                    // onOpenChange(false); // Optional: close on complete
                }}
                disabled={isCompleted}
                className={cn(
                    "w-full sm:w-auto",
                    isCompleted ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
                )}
            >
                {isCompleted ? (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                    </>
                ) : (
                    "Mark as Complete"
                )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
