
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: string;
  name: string;
  color?: string | null;
  _count?: { wallets: number };
}

interface GroupManagerProps {
  groups: Group[];
  onUpdate: () => void;
}

export function GroupManager({ groups, onUpdate }: GroupManagerProps) {
  const [open, setOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (res.ok) {
        setNewGroupName("");
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to create group", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Manage Groups
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Wallet Groups</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="New group name..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={!newGroupName.trim() || isCreating}>
              {isCreating ? "Adding..." : "Add"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Existing Groups</Label>
            <div className="flex flex-wrap gap-2 min-h-[100px] border rounded-md p-3">
              {groups.length === 0 && (
                <p className="text-sm text-muted-foreground">No groups created yet.</p>
              )}
              {groups.map((group) => (
                <Badge key={group.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                  <span>{group.name}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">({group._count?.wallets || 0})</span>
                  {/* Delete functionality could be added here */}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
           <Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
