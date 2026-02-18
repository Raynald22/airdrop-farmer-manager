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
import { Plus, Upload, X, Loader2 } from "lucide-react";

// Basic regex for non-EVM chains
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const BTC_REGEX = /^(1|3|bc1)[a-zA-Z0-9]{25,59}$/;

const formSchema = z.object({
  addresses: z.string().min(1, "Paste at least one address"),
  label: z.string().optional(),
  proxy: z.string().optional(),
});

interface WalletInputProps {
  onAddWallets: (wallets: { address: string; label?: string; proxy?: string; type: "EVM" | "SOL" | "BTC" }[]) => void;
  currentCount: number;
  maxCount: number;
}
// ... (inside component)
        const walletsToAdd = validWallets.map((w) => ({
            address: w.address,
            type: w.type,
            label: values.label || undefined,
            proxy: values.proxy || undefined,
        }));
// ... (inside JSX form)
          <Input
            placeholder="Label (optional, e.g. 'Main Wallets')"
            className="h-8 text-sm bg-muted/30 border-border/50"
            {...form.register("label")}
          />
          <Input
            placeholder="Proxy (optional, http://user:pass@host:port)"
            className="h-8 text-sm bg-muted/30 border-border/50 font-mono"
            {...form.register("proxy")}
          />
          <Textarea

export function WalletInput({ onAddWallets, currentCount, maxCount }: WalletInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { addresses: "", label: "" },
  });

  function getWalletType(address: string): "EVM" | "SOL" | "BTC" | "UNKNOWN" {
      if (isAddress(address)) return "EVM";
      if (SOL_REGEX.test(address)) return "SOL";
      if (BTC_REGEX.test(address)) return "BTC";
      return "UNKNOWN";
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setIsSubmitting(true);
    
    try {
        const rawLines = values.addresses.split(/[\n,]+/).map((a) => a.trim()).filter(Boolean);
        
        const validWallets: { address: string; type: "EVM" | "SOL" | "BTC" }[] = [];
        let invalidCount = 0;

        rawLines.forEach(addr => {
            const type = getWalletType(addr);
            if (type !== "UNKNOWN") {
                validWallets.push({ address: addr, type });
            } else {
                invalidCount++;
            }
        });

        const remaining = maxCount - currentCount;

        if (validWallets.length === 0) {
            setError("No valid EVM, Solana, or Bitcoin addresses found.");
            setIsSubmitting(false);
            return;
        }

        if (validWallets.length > remaining) {
            setError(`Free tier limit: you can only add ${remaining} more wallet(s). Upgrade to Pro for unlimited.`);
            setIsSubmitting(false);
            return;
        }

        const walletsToAdd = validWallets.map((w) => ({
            address: w.address,
            type: w.type,
            label: values.label || undefined,
        }));

        // Await the parent callback if it's async (it is in useWallets)
        await onAddWallets(walletsToAdd);
        
        form.reset();
        setIsOpen(false);

        if (invalidCount > 0) {
            console.warn(`Skipped ${invalidCount} invalid addresses.`);
        }
    } catch (e) {
        console.error("Failed to add wallets", e);
        setError("Failed to add wallets. Please try again.");
    } finally {
        setIsSubmitting(false);
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
              Supports EVM (0x...), Solana, and Bitcoin addresses.
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
            placeholder={"0xd8dA...\nHi7d...\nbc1q..."}
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
              <Button type="submit" size="sm" className="text-xs h-8 gap-1.5" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                {isSubmitting ? "Importing..." : "Import"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
