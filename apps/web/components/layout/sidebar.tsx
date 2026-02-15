import {
  LayoutDashboard,
  Wallet,
  Activity,
  Bell,
  Settings,
  Shield,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Wallets", href: "/wallets", icon: Wallet },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Scoring", href: "/scoring", icon: TrendingUp },
  { label: "Sybil Check", href: "/sybil", icon: Shield, badge: "Pro" },
  { label: "Alerts", href: "/alerts", icon: Bell },
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
        {bottomItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        {/* Upgrade CTA */}
        <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs font-semibold text-primary">Upgrade to Pro</p>
          <p className="text-[10px] text-muted-foreground mt-1">Track unlimited wallets</p>
          <button className="mt-2 w-full text-[11px] font-medium bg-primary text-primary-foreground rounded-md py-1.5 hover:bg-primary/90 transition-colors">
            Upgrade — $29/mo
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item }: { item: NavItem }) {
  // In production, use usePathname() to determine active state
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
    >
      <item.icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="text-[9px] font-bold uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
