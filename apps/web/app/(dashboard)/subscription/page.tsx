
"use client";

import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner

// Price IDs from webhook
const PRICE_IDS = {
    pro: "price_1T1sYDDuwsWR5LkOUwmX3c79",
    whale: "price_1T1sYzDuwsWR5LkOoqKiEJ4y"
};

export default function PricingPage() {
    const { user } = useUser();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (tier: "pro" | "whale") => {
        setLoading(tier);
        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId: PRICE_IDS[tier] })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No URL returned");
                setLoading(null);
            }
        } catch (e) {
            console.error(e);
            setLoading(null);
        }
    };

    return (
        <div className="container py-10 max-w-5xl mx-auto space-y-10">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Choose the plan that fits your farming scale. Upgrade or downgrade at any time.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Free Tier */}
                <PricingCard 
                    title="Free"
                    price="$0"
                    description="For hobbyists just starting out."
                    features={[
                        "Track up to 5 wallets",
                        "Manual refresh only",
                        "Basic dashboard",
                        "Community support"
                    ]}
                    action={<Button variant="outline" className="w-full" disabled>Current Plan</Button>}
                />

                {/* Pro Tier */}
                <PricingCard 
                    title="Pro"
                    price="$29"
                    description="For serious farmers managing multiple accounts."
                    featured
                    features={[
                        "Track up to 50 wallets",
                        "Auto-Refresh (1 hour)",
                        "Sybil Detection Checks",
                        "Priority Support",
                        "No Ads"
                    ]}
                    action={
                        <Button 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            onClick={() => handleSubscribe("pro")}
                            disabled={!!loading}
                        >
                            {loading === "pro" ? <Loader2 className="animate-spin" /> : "Upgrade to Pro"}
                        </Button>
                    }
                />

                {/* Whale Tier */}
                <PricingCard 
                    title="Whale"
                    price="$99"
                    description="Complete automation for large-scale operations."
                    features={[
                        "Unlimited Wallets",
                        "Fully Auto-Farming Bot 🤖",
                        "Custom Proxy Support",
                        "Priority Execution",
                        "Private Discord Channel"
                    ]}
                    action={
                        <Button 
                            variant="secondary" 
                            className="w-full border-primary/20 hover:bg-primary/10"
                            onClick={() => handleSubscribe("whale")}
                            disabled={!!loading}
                        >
                            {loading === "whale" ? <Loader2 className="animate-spin" /> : "Become a Whale"}
                        </Button>
                    }
                />
            </div>
        </div>
    );
}

function PricingCard({ title, price, description, features, action, featured }: any) {
    return (
        <Card className={`relative flex flex-col ${featured ? 'border-primary shadow-lg shadow-primary/20 scale-105 z-10' : 'border-border/50'}`}>
            {featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Most Popular
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <ul className="space-y-3 text-sm">
                    {features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                {action}
            </CardFooter>
        </Card>
    )
}
