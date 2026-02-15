import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Farmer Manager — Airdrop Wallet Tracker",
  description: "Track your airdrop farming across zkSync, Scroll, Base & more chains. Free to start.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
