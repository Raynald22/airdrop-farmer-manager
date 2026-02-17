"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Wallet, ShieldAlert, ListTodo, X } from "lucide-react";

export function GettingStarted() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hidden = localStorage.getItem("hide-getting-started");
    if (hidden === "true") {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("hide-getting-started", "true");
  };

  if (!isVisible) return null;

  return (
    <Card className="glass border-primary/20 bg-primary/5 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          🚀 Getting Started with Airdrop Farmer Manager
        </CardTitle>
        <CardDescription>
          Master the art of multi-chain farming with these simple steps.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          
          <AccordionItem value="item-1" className="border-b-primary/10">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Step 1: Import Your Wallets</div>
                  <div className="text-xs text-muted-foreground font-normal">Support for EVM, Solana, and Bitcoin</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-11 space-y-2">
              <p>
                Click the <strong>Add Wallets</strong> button at the top right. You can paste multiple addresses at once (one per line).
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>EVM:</strong> Any 0x address (Ethereum, Base, Arbitrum, etc.)</li>
                <li><strong>Solana:</strong> Base58 addresses (e.g., 88yW...)</li>
                <li><strong>Bitcoin:</strong> Legacy (1...), Segwit (3...), or Bech32 (bc1...)</li>
              </ul>
              <p className="mt-2 text-xs bg-muted/50 p-2 rounded">
                💡 <strong>Pro Tip:</strong> Group your wallets (e.g., "Main Account", "Sybil Set A") to organize your farming strategy.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-b-primary/10">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Step 2: Monitor Sybil Risks</div>
                  <div className="text-xs text-muted-foreground font-normal">Avoid getting disqualified</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-11 space-y-2">
              <p>
                Our AI analyzes your on-chain footprint to detect "bot-like" behavior.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs border border-emerald-400/20 bg-emerald-400/5 p-2 rounded">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" /> Safe
                </div>
                <div className="flex items-center gap-2 text-red-400 text-xs border border-red-400/20 bg-red-400/5 p-2 rounded">
                  <div className="h-2 w-2 rounded-full bg-red-400" /> Critical Risk
                </div>
              </div>
              <p className="mt-2">
                Common triggers: Low contract diversity, round number transfers (e.g. 1.00 ETH), or identical funding sources.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-none">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Step 3: Track & Complete Tasks</div>
                  <div className="text-xs text-muted-foreground font-normal">Detailed checklists for every airdrop</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground pl-11 space-y-2">
              <p>
                Go to the <strong>Airdrops</strong> page to see active campaigns (e.g., LayerZero, zkSync).
              </p>
              <p>
                Click on a campaign to see a tailored checklist. Mark tasks as done to update your progress. Some tasks verified on-chain will auto-update!
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
}
