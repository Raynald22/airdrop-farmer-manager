
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Plus, Tag } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Group {
  id: string;
  name: string;
}

interface WalletGroupSelectProps {
  walletId: string;
  assignedGroups: Group[];
  allGroups: Group[];
  onUpdate: () => void;
}

export function WalletGroupSelect({
  walletId,
  assignedGroups,
  allGroups,
  onUpdate,
}: WalletGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleGroup = async (groupId: string) => {
    setLoading(true);
    try {
      const isAssigned = assignedGroups.some((g) => g.id === groupId);
      const newGroups = isAssigned
        ? assignedGroups.filter((g) => g.id !== groupId)
        : [...assignedGroups, allGroups.find((g) => g.id === groupId)!];

      const res = await fetch(`/api/wallets/${walletId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groups: newGroups.map((g) => g.id),
        }),
      });

      if (!res.ok) throw new Error("Failed to update groups");

      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update groups");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="h-8 justify-start px-2 w-full font-normal hover:bg-muted/50"
        >
          {assignedGroups.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {assignedGroups.slice(0, 2).map((g) => (
                <Badge key={g.id} variant="secondary" className="px-1 py-0 text-[10px] h-5">
                  {g.name}
                </Badge>
              ))}
              {assignedGroups.length > 2 && (
                <Badge variant="secondary" className="px-1 py-0 text-[10px] h-5">
                  +{assignedGroups.length - 2}
                </Badge>
              )}
            </div>
          ) : (
             <span className="text-muted-foreground text-xs flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <Plus className="h-3 w-3" /> Add tag
             </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search groups..." />
          <CommandList>
            <CommandEmpty>
                No groups found.
            </CommandEmpty>
            <CommandGroup>
              {allGroups.map((group) => {
                const isSelected = assignedGroups.some((g) => g.id === group.id);
                return (
                  <CommandItem
                    key={group.id}
                    value={group.name}
                    onSelect={() => toggleGroup(group.id)}
                    disabled={loading}
                  >
                    <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                    )}>
                        <Check className={cn("h-4 w-4")} />
                    </div>
                    {group.name}
                    {loading && <Loader2 className="ml-auto h-3 w-3 animate-spin"/>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
