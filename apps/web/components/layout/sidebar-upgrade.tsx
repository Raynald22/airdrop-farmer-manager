
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export function SidebarUpgrade() {
    const { user } = useUser();
    const [tier, setTier] = useState<string>("free");

    useEffect(() => {
        async function checkTier() {
            if (!user) return;
            try {
                const res = await fetch("/api/user/tier");
                const data = await res.json();
                setTier(data.tier);
            } catch (e) { console.error(e) }
        }
        checkTier();
    }, [user]);

    if (tier === "whale") return null;

    return (
        <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs font-semibold text-primary">
                {tier === "pro" ? "Become a Whale 🐋" : "Upgrade to Pro ⚡"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
                {tier === "pro" ? "Unlock Auto-Farming" : "Track unlimited wallets"}
            </p>
            <Link href="/pricing">
                <button className="mt-2 w-full text-[11px] font-medium bg-primary text-primary-foreground rounded-md py-1.5 hover:bg-primary/90 transition-colors">
                    Upgrade Now
                </button>
            </Link>
        </div>
    );
}
