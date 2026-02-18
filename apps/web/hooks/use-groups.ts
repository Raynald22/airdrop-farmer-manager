
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Group {
    id: string;
    name: string;
    color?: string | null;
    _count?: { wallets: number };
}

async function fetchGroups(): Promise<Group[]> {
    const res = await fetch("/api/groups");
    if (!res.ok) throw new Error("Failed to fetch groups");
    return res.json();
}

async function deleteGroup(id: string): Promise<void> {
    const res = await fetch(`/api/groups?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete group");
}

export function useGroups() {
    const queryClient = useQueryClient();

    const { data: groups = [], isLoading, error } = useQuery({
        queryKey: ["groups"],
        queryFn: fetchGroups,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteGroup,
        onSuccess: () => {
            // Invalidate both groups and wallets since wallets might have references to deleted groups
            queryClient.invalidateQueries({ queryKey: ["groups"] });
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
    });

    const refreshGroups = () => {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
    };

    return {
        groups,
        isLoading,
        error,
        deleteGroup: deleteMutation.mutate,
        refreshGroups,
        isDeleting: deleteMutation.isPending,
    };
}
