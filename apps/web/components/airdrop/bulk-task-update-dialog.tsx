"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Layers, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Wallet {
  id: string;
  label?: string | null;
  address: string;
  type?: string;
}

interface Task {
  id: string;
  title: string;
}

interface BulkTaskUpdateDialogProps {
  tasks: Task[];
  wallets: Wallet[];
  onSuccess?: () => void;
}

export function BulkTaskUpdateDialog({ tasks, wallets, onSuccess }: BulkTaskUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWallets(wallets.map((w) => w.id));
    } else {
      setSelectedWallets([]);
    }
  };

  const handleSelectWallet = (walletId: string, checked: boolean) => {
    if (checked) {
      setSelectedWallets((prev) => [...prev, walletId]);
    } else {
      setSelectedWallets((prev) => prev.filter((id) => id !== walletId));
    }
  };

  const handleSubmit = async () => {
    if (!selectedTask || selectedWallets.length === 0) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletIds: selectedWallets,
          taskId: selectedTask,
          status: "completed",
        }),
      });

      if (!res.ok) throw new Error("Failed to update tasks");

      toast.success(`Updated ${selectedWallets.length} wallets successfully!`);
      setOpen(false);
      setSelectedWallets([]);
      setSelectedTask("");
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Layers className="h-4 w-4" />
          Bulk Update
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Tasks</DialogTitle>
          <DialogDescription>
            Mark a task as completed for multiple wallets at once.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Select Task</Label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task..." />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Wallets ({selectedWallets.length})</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                    id="select-all" 
                    checked={selectedWallets.length === wallets.length && wallets.length > 0}
                    onCheckedChange={(c) => handleSelectAll(c as boolean)}
                />
                <label
                  htmlFor="select-all"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All
                </label>
              </div>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                <div className="space-y-2">
                    {wallets.map((wallet) => (
                    <div key={wallet.id} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                        <Checkbox 
                            id={wallet.id} 
                            checked={selectedWallets.includes(wallet.id)}
                            onCheckedChange={(c) => handleSelectWallet(wallet.id, c as boolean)}
                        />
                        <label
                        htmlFor={wallet.id}
                        className="text-sm cursor-pointer flex-1"
                        >
                            <span className="font-medium">
                                {wallet.label || "Untitled"}
                            </span>
                            <span className="text-muted-foreground ml-2 text-xs">
                                ({wallet.address.slice(0, 6)}...{wallet.address.slice(-4)})
                            </span>
                        </label>
                    </div>
                    ))}
                </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedTask || selectedWallets.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark as Completed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
