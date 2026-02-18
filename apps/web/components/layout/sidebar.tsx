"use client";

import {
  LayoutDashboard,
  Wallet,
  Activity,
  Bell,
  Settings,
  Shield,
  TrendingUp,
  Gift,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarUpgrade } from "./sidebar-upgrade";
import { BotSettingsDialog } from "../settings/bot-settings-dialog";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Airdrops", href: "/airdrops", icon: Gift },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Activity & Alerts", href: "/activity", icon: Activity },
  { label: "Scoring", href: "/scoring", icon: TrendingUp },
  { label: "Sybil Check", href: "/sybil", icon: Shield, badge: "Pro" },
  // { label: "Alerts", href: "/alerts", icon: Bell }, // Removed: Consolidated into Activity
];

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center glow-blue">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Farmer Manager</h1>
          <p className="text-[10px] text-muted-foreground">Airdrop Tracking SaaS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-border/50 space-y-1">
        <BotSettingsDialog />
        {/* Upgrade CTA */}
        <SidebarUpgrade />
      </div>
    </aside>
  );
}

import { usePathname } from "next/navigation";

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" 
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-bold uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
