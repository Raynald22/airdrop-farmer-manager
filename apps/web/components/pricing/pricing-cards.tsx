
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PricingCardsProps {
    currentTier: string; // "free", "pro", "whale"
}

const plans = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    description: "For casual airdrop farmers.",
    features: [
      "Track up to 3 wallets",
      "Manual task verification",
      "Basic dashboard stats",
      "Community support",
    ],
    limitations: [
      "No auto-farming bot",
      "Limited Sybil analysis",
      "No priority alerts",
    ],
    priceId: null, 
    popular: false,
  },
  {
    name: "Pro",
    id: "pro",
    price: "$29",
    period: "/month",
    description: "Serious farmers who want efficiency.",
    features: [
      "Track up to 20 wallets",
      "Advanced Sybil detection",
      "Priority notification alerts",
      "Export data to CSV",
      "Detailed wallet analytics",
    ],
    limitations: [
      "No auto-farming bot",
    ],
    priceId: "price_1T1sYDDuwsWR5LkOUwmX3c79",
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Whale",
    id: "whale",
    price: "$99",
    period: "/month",
    description: "Fully automated empire building.",
    features: [
      "Unlimited wallets",
      "🤖 Auto-Farming Bot Access",
      "Real on-chain automation",
      "Critical security monitoring",
      "Private Alpha Group Access",
      "White-glove support",
    ],
    limitations: [],
    priceId: "price_1T1sYzDuwsWR5LkOoqKiEJ4y",
    buttonText: "Become a Whale",
    popular: false,
  },
];

export function PricingCards({ currentTier }: PricingCardsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const onSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (response.status === 401) {
          toast.error("Please sign in to upgrade.");
          router.push("/sign-in");
          return;
      }

      if (!response.ok) {
        throw new Error(data || "Something went wrong");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const getButtonState = (planId: string, priceId: string | null) => {
      // 1. Current Plan
      if (currentTier === planId) {
          return { text: "Current Plan", disabled: true, variant: "outline" as const };
      }

      // 2. Free Plan (Downgrade logic not automated yet, but UI should reflect)
      if (planId === "free") {
          return { text: "Free Plan", disabled: true, variant: "outline" as const };
      }

      // 3. Upgrade/Switch
      // If user is Free -> Upgrade to Pro or Whale
      // If user is Pro -> Upgrade to Whale, Downgrade to Free (manual)
      return { 
          text: planId === "whale" ? "Become a Whale" : "Upgrade to Pro", 
          disabled: false, 
          variant: (planId === "pro" ? "default" : "outline") as "default" | "outline"
      };
  };

  return (
    <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-3">
        {plans.map((plan, planIdx) => {
            const btnState = getButtonState(plan.id, plan.priceId);
            
            return (
            <div
                key={plan.name}
                className={`
                relative flex flex-col justify-between rounded-3xl p-8 ring-1 ring-gray-200 xl:p-10 transition-all duration-300
                ${plan.popular ? 'z-10 bg-background shadow-xl scale-110 ring-primary' : 'bg-background/50 ring-gray-200 lg:bg-transparent lg:pb-9'}
                ${planIdx === 0 ? 'lg:rounded-r-none lg:border-r-0' : ''}
                ${planIdx === 2 ? 'lg:rounded-l-none lg:border-l-0' : ''}
                `}
            >
                <div>
                <div className="flex items-center justify-between gap-x-4">
                    <h3 className={`text-lg font-semibold leading-8 ${plan.popular ? 'text-primary' : ''}`}>
                    {plan.name}
                    </h3>
                    {plan.popular && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                        Most popular
                    </span>
                    )}
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-sm font-semibold leading-6 text-muted-foreground">{plan.period}</span>}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                    {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                    </li>
                    ))}
                    {plan.limitations?.map((limitation) => (
                    <li key={limitation} className="flex gap-x-3 text-muted-foreground/50">
                        <X className="h-6 w-5 flex-none" aria-hidden="true" />
                        {limitation}
                    </li>
                    ))}
                </ul>
                </div>
                <Button
                onClick={() => {
                    if (plan.priceId) {
                        onSubscribe(plan.priceId);
                    } else {
                        // Free plan logic (if needed, e.g. downgrade)
                        toast.info("You are on the Free plan.");
                    }
                }}
                disabled={btnState.disabled || (plan.priceId !== null && loading === plan.priceId)}
                variant={plan.popular && !btnState.disabled ? "default" : "outline"}
                className="mt-8"
                aria-describedby={plan.name}
                >
                {loading === plan.priceId ? "Processing..." : btnState.text}
                </Button>
            </div>
            );
        })}
    </div>
  );
}
