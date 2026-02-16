
"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@/hooks/use-wallets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { GroupManager } from "@/components/wallets/group-manager";
import { GroupFilter } from "@/components/wallets/group-filter";
import { Badge } from "@/components/ui/badge";

interface WalletGroup {
  id: string;
  name: string;
  _count?: { wallets: number };
}

export default function WalletsPage() {
  const { wallets, isLoading, isError, mutate } = useWallets();
  const [groups, setGroups] = useState<WalletGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Update wallet groups
  const handleUpdateGroups = async (walletId: string, groupIds: string[]) => {
    try {
      const res = await fetch(`/api/wallets/${walletId}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupIds }),
      });
      if (res.ok) {
        mutate(); // Refresh wallets to show new groups
        fetchGroups(); // Refresh groups to update counts if needed
      }
    } catch (error) {
      console.error("Failed to update wallet groups", error);
    }
  };

  // Filter wallets
  const filteredWallets = wallets.filter((wallet: any) => {
    const matchesSearch =
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.label?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedGroupId) {
      const inGroup = wallet.groups?.some((g: any) => g.id === selectedGroupId);
      return matchesSearch && inGroup;
    }
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallets</h1>
          <p className="text-muted-foreground">
            Manage your farming wallets and organize them into groups.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <GroupManager groups={groups} onUpdate={fetchGroups} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or label..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-none">
           <GroupFilter 
              groups={groups} 
              selectedGroupId={selectedGroupId} 
              onSelect={setSelectedGroupId} 
           />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">No wallets found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredWallets.map((wallet: any) => (
            <div
              key={wallet.id}
              className="flex items-center justify-between p-4 bg-card border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">
                    {wallet.address}
                  </span>
                  {wallet.label && (
                    <Badge variant="outline" className="text-xs">
                      {wallet.label}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  {wallet.groups?.length > 0 ? (
                    wallet.groups.map((g: any) => (
                      <Badge key={g.id} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                        {g.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No groups</span>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Assign Groups</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {groups.length === 0 && (
                     <div className="p-2 text-xs text-muted-foreground text-center">
                        No groups created yet.
                     </div>
                  )}
                  {groups.map((group) => {
                    const isChecked = wallet.groups?.some((g: any) => g.id === group.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={group.id}
                        checked={isChecked}
                        onCheckedChange={(checked: boolean) => {
                           // Try optimistic update or just call API
                           const currentIds = wallet.groups?.map((g: any) => g.id) || [];
                           const newIds = checked 
                              ? [...currentIds, group.id]
                              : currentIds.filter((id: string) => id !== group.id);
                           handleUpdateGroups(wallet.id, newIds);
                        }}
                      >
                        {group.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
