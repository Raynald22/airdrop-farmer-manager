"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Bell,
  BarChart3,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Wallet,
    title: "Multi-Wallet Tracking",
    description: "Import and track 100+ wallets across 7 EVM chains simultaneously.",
    color: "text-blue-400",
  },
  {
    icon: TrendingUp,
    title: "Eligibility Scoring",
    description: "Real-time airdrop readiness scores with red/yellow/green indicators.",
    color: "text-emerald-400",
  },
  {
    icon: Shield,
    title: "Anti-Sybil Detection",
    description: "Pattern analysis to catch risky wallet behavior before protocols do.",
    color: "text-purple-400",
  },
  {
    icon: Zap,
    title: "Gas Optimization",
    description: "Alerts when gas prices drop—farm at the cheapest times possible.",
    color: "text-amber-400",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Notifications for idle wallets, new opportunities, and deadlines.",
    color: "text-rose-400",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Aggregated stats on TX counts, volumes, and chain coverage.",
    color: "text-cyan-400",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with basic tracking",
    features: ["5 wallets", "2 chains", "Basic scoring", "Community support"],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious airdrop farmers",
    features: [
      "50 wallets",
      "All 7 chains",
      "Advanced scoring",
      "Sybil detection",
      "Smart alerts",
      "Email notifications",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Whale",
    price: "$99",
    period: "/month",
    description: "Enterprise-grade farming ops",
    features: [
      "Unlimited wallets",
      "All chains + custom RPCs",
      "Full analytics suite",
      "API access",
      "Telegram alerts",
      "Team accounts",
      "1-on-1 onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const chains = [
  { name: "zkSync Era", icon: "◆", color: "#8B8DFC" },
  { name: "Scroll", icon: "📜", color: "#FFBE98" },
  { name: "Base", icon: "🔵", color: "#0052FF" },
  { name: "Linea", icon: "▬", color: "#61DFFF" },
  { name: "Arbitrum", icon: "🔷", color: "#28A0F0" },
  { name: "Optimism", icon: "🔴", color: "#FF0420" },
  { name: "Ethereum", icon: "⟠", color: "#627EEA" },
];

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const prindIds = {
  free: "",
  pro: "price_1QWX...", // Replace with real Stripe Price ID
  whale: "price_1QYZ..." // Replace with real Stripe Price ID
};

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planName: string, priceId?: string) => {
    if (!isLoaded) return;
    
    if (!user) {
      router.push("/sign-up");
      return;
    }

    if (planName.toLowerCase() === "free") {
      router.push("/dashboard");
      return;
    }

    if (!priceId) {
      alert("Stripe Price ID not configured");
      return;
    }

    setLoading(planName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm">Farmer Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Features
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Pricing
            </Link>
            <Link href="/">
              <Button size="sm" className="text-xs h-8">
                Launch App <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 px-3 py-1">
            🔥 Now tracking 7 EVM chains
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Stop Guessing.
            <br />
            <span className="gradient-text">Start Farming Smarter.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track 100+ wallets across zkSync, Scroll, Base & more.
            Real-time eligibility scoring, anti-sybil warnings, and smart alerts
            — so you never miss an airdrop again.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/">
              <Button size="lg" className="gap-2 text-sm px-6">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-sm px-6 border-border/50 bg-transparent">
              View Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            No credit card required • 5 free wallets forever
          </p>
        </div>
      </section>

      {/* Chain Logos */}
      <section className="py-10 border-y border-border/20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground mb-6 uppercase tracking-wider font-medium">
            Supported Chains
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {chains.map((chain) => (
              <div key={chain.name} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="text-lg">{chain.icon}</span>
                <span className="text-xs font-medium">{chain.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Everything You Need to Farm
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              From wallet tracking to sybil detection, we got you covered.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="glass border-border/30 hover:border-primary/20 transition-all duration-300 group"
              >
                <CardContent className="p-5 space-y-3">
                  <div className={cn("p-2 w-fit rounded-lg bg-primary/5", feature.color)}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-sm">
              Start free, upgrade when you&apos;re ready.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative glass border-border/30 transition-all duration-300",
                  plan.highlighted && "border-primary/50 glow-blue scale-[1.02]"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-3">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                  <div className="pt-3">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className={cn(
                      "w-full text-xs",
                      plan.highlighted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                    size="sm"
                    disabled={loading === plan.name}
                    onClick={() => handleCheckout(plan.name, plan.name === "Pro" ? "price_PRO_ID" : (plan.name === "Whale" ? "price_WHALE_ID" : undefined))}
                  >
                    {loading === plan.name ? "Processing..." : plan.cta}
                  </Button>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/20">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Farm Smarter?
          </h2>
          <p className="text-sm text-muted-foreground">
            Join thousands of airdrop hunters who track their wallets with Farmer Manager.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2 text-sm px-8">
              Launch App — It&apos;s Free <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Farmer Manager</span>
          </div>
          <p>© {new Date().getFullYear()} Farmer Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
