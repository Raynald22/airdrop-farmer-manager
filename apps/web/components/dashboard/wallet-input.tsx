"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAddress } from "viem";
import { Plus, Upload, X } from "lucide-react";

const formSchema = z.object({
  addresses: z.string().min(1, "Paste at least one address"),
  label: z.string().optional(),
});

interface WalletInputProps {
  onAddWallets: (wallets: { address: string; label?: string }[]) => void;
  currentCount: number;
  maxCount: number;
}

export function WalletInput({ onAddWallets, currentCount, maxCount }: WalletInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { addresses: "", label: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    const rawLines = values.addresses.split(/[\n,]+/).map((a) => a.trim()).filter(Boolean);
    const validAddresses = rawLines.filter((addr) => isAddress(addr));
    const invalidCount = rawLines.length - validAddresses.length;
    const remaining = maxCount - currentCount;

    if (validAddresses.length === 0) {
      setError("No valid EVM addresses found.");
      return;
    }

    if (validAddresses.length > remaining) {
      setError(`Free tier limit: you can only add ${remaining} more wallet(s). Upgrade to Pro for unlimited.`);
      return;
    }

    const walletsToAdd = validAddresses.map((addr) => ({
      address: addr,
      label: values.label || undefined,
    }));

    onAddWallets(walletsToAdd);
    form.reset();
    setIsOpen(false);

    if (invalidCount > 0) {
      // Could use toast here
      console.warn(`Skipped ${invalidCount} invalid addresses.`);
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        size="sm"
      >
        <Plus className="h-4 w-4" />
        Add Wallets
      </Button>
    );
  }

  return (
    <Card className="glass border-primary/20 glow-blue">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Import Wallets
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Paste EVM addresses (one per line or comma-separated)
            </CardDescription>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-accent/50">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Input
            placeholder="Label (optional, e.g. 'Main Wallets')"
            className="h-8 text-sm bg-muted/30 border-border/50"
            {...form.register("label")}
          />
          <Textarea
            placeholder={"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\n0x503828976D22510aad0201ac7EC88293211D23Da"}
            className="min-h-[120px] font-mono text-xs bg-muted/30 border-border/50 resize-none"
            {...form.register("addresses")}
          />
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">
              {currentCount}/{maxCount} wallets used (Free tier)
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs h-8 gap-1.5">
                <Upload className="h-3 w-3" />
                Import
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
