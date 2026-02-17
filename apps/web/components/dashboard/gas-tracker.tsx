"use client";

import { useEffect, useState } from "react";
import { Fuel, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface GasData {
  chain: string;
  gwei: number;
}

const CHAINS = [
  { name: "ETH", rpc: "https://eth.llama.rpc.com" },
  { name: "Scroll", rpc: "https://rpc.scroll.io" },
  { name: "Linea", rpc: "https://rpc.linea.build" },
];

export function GasTracker() {
  const [gasPrices, setGasPrices] = useState<GasData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGas = async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        CHAINS.map(async (chain) => {
          try {
            const res = await fetch(chain.rpc, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_gasPrice",
                params: [],
                id: 1,
              }),
            });
            const data = await res.json();
            const wei = parseInt(data.result, 16);
            const gwei = Math.round((wei / 1e9) * 10) / 10; // 1 decimal place
            return { chain: chain.name, gwei };
          } catch (e) {
            console.error(`Failed to fetch gas for ${chain.name}`, e);
            return { chain: chain.name, gwei: 0 };
          }
        })
      );
      setGasPrices(results);
    } catch (error) {
      console.error("Gas fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGas();
    const interval = setInterval(fetchGas, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 text-sm border px-3 py-1.5 rounded-full bg-background/50 backdrop-blur shadow-sm">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Fuel className="h-4 w-4" />
        <span className="font-medium text-foreground">Gas:</span>
      </div>
      
      {loading && gasPrices.length === 0 ? (
        <span className="text-muted-foreground animate-pulse">Loading...</span>
      ) : (
        <div className="flex items-center gap-3">
          {gasPrices.map((gas) => (
            <div key={gas.chain} className="flex items-center gap-1">
              <span className="text-muted-foreground text-xs">{gas.chain}</span>
              <span 
                className={cn(
                  "font-bold",
                  gas.gwei < 20 ? "text-green-500" : gas.gwei < 50 ? "text-yellow-500" : "text-red-500"
                )}
              >
                {gas.gwei}
              </span>
            </div>
          ))}
        </div>
      )}
      
      <button 
        onClick={fetchGas} 
        disabled={loading}
        className={cn("bg-transparent p-0 hover:bg-transparent", loading && "animate-spin")}
      >
        <RefreshCw className="h-3 w-3 text-muted-foreground hover:text-primary transition-colors" />
      </button>
    </div>
  );
}
