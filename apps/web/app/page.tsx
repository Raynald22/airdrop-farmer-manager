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
  ShieldCheck,
  LayoutDashboard,
  Users,
  Globe,
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
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/20">

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-white">Farmer Manager</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="h-9 px-4 bg-white text-black hover:bg-zinc-200 font-medium transition-all">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live on 7 EVM Chains
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
            Automate Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              Airdrop Operations
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
            Professional-grade tools for multi-wallet management. 
            Track eligibility, analyze Sybil risk, and automate interactions with precision.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-lg shadow-indigo-500/25 transition-all w-full sm:w-auto">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Start Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white w-full sm:w-auto">
              Read Documentation
            </Button>
          </div>

          {/* Stats / Social Proof */}
          <div className="pt-12 flex items-center justify-center gap-8 text-zinc-500 text-sm font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>1,000+ Wallets Tracked</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              <span>0% Downtime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Networks - Minimalist Marquee */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-8">
            Integrated Networks
          </p>
          <div className="flex flex-wrap justify-center gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {chains.map((chain) => (
              <div key={chain.name} className="flex items-center gap-3 group cursor-default">
                 {/* Replaced generic icons with colored dots for now, in real app use SVGs */}
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: chain.color }} />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {chain.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-black relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Engineering Precision for <br />
              <span className="text-indigo-400">DeFi Scale.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              We stripped away the noise to provide raw data, actionable insights, and 
              automation infrastructure for serious farmers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="group relative p-8 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-indigo-500/30 transition-all duration-300 hover:bg-zinc-900/60"
              >
                <div className="mb-6 inline-flex p-3 rounded-lg bg-zinc-800/50 text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-500/10 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5 bg-zinc-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Scalable Pricing
            </h2>
            <p className="text-zinc-400">
              Transparent costs. Cancel anytime.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative p-8 rounded-2xl border transition-all duration-300 flex flex-col",
                  plan.highlighted 
                    ? "bg-zinc-900/80 border-indigo-500/50 shadow-2xl shadow-indigo-500/10" 
                    : "bg-black/40 border-white/5 hover:border-white/10"
                )}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-500 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-4 h-10">{plan.description}</p>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-3">
                      <Check className={cn("h-5 w-5 shrink-0", plan.highlighted ? "text-indigo-400" : "text-zinc-600")} />
                      <span className="text-sm text-zinc-300">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={cn(
                    "w-full h-11 text-sm font-medium transition-all",
                    plan.highlighted
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-zinc-100 text-zinc-900 hover:bg-white"
                  )}
                  disabled={loading === plan.name}
                  onClick={() => handleCheckout(plan.name, plan.name === "Pro" ? "price_PRO_ID" : (plan.name === "Whale" ? "price_WHALE_ID" : undefined))}
                >
                  {loading === plan.name ? "Processing..." : plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTO / Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-indigo-500/20 flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-white">Farmer Manager</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="https://twitter.com" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="https://github.com" className="hover:text-white transition-colors">GitHub</Link>
          </div>
          
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Farmer Manager Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
