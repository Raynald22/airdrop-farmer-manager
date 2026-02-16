
"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Group {
  id: string;
  name: string;
}

interface GroupFilterProps {
  groups: Group[];
  selectedGroupId: string | null;
  onSelect: (groupId: string | null) => void;
}

export function GroupFilter({ groups, selectedGroupId, onSelect }: GroupFilterProps) {
  return (
    <div className="flex gap-2 text-sm overflow-x-auto pb-2 scrollbar-none">
      <Button
        variant={selectedGroupId === null ? "default" : "outline"}
        size="sm"
        onClick={() => onSelect(null)}
        className="rounded-full"
      >
        All
      </Button>
      {groups.map((group) => (
        <Button
          key={group.id}
          variant={selectedGroupId === group.id ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(group.id)}
          className={cn(
             "rounded-full whitespace-nowrap",
             selectedGroupId === group.id && "bg-primary text-primary-foreground"
          )}
        >
          {group.name}
        </Button>
      ))}
    </div>
  );
}
