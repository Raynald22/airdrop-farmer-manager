import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet } from "@repo/shared";

async function fetchWallets(): Promise<Wallet[]> {
    const res = await fetch("/api/wallets");
    if (!res.ok) throw new Error("Failed to fetch wallets");
    return res.json();
}

async function addWallet(data: { address: string; label?: string; type?: "EVM" | "SOL" | "BTC" }): Promise<Wallet> {
    const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add wallet");
    return res.json();
}

async function deleteWallet(id: string): Promise<void> {
    const res = await fetch(`/api/wallets/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete wallet");
}

export function useWallets() {
    const queryClient = useQueryClient();

    const { data: wallets = [], isLoading, error } = useQuery({
        queryKey: ["wallets"],
        queryFn: fetchWallets,
    });

    const addMutation = useMutation({
        mutationFn: addWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteWallet,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
    });

    const refreshMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/wallets/${id}/refresh`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to refresh wallet");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["wallets"] });
        },
    });

    return {
        wallets,
        isLoading,
        error,
        addWallet: addMutation.mutate,
        deleteWallet: deleteMutation.mutate,
        refreshWallet: refreshMutation.mutate,
        isAdding: addMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isRefreshing: refreshMutation.isPending,
        mutate: () => queryClient.invalidateQueries({ queryKey: ["wallets"] }),
        isError: !!error,
    };
}
