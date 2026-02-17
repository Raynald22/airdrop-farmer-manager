import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://airdrop-farmer.com"),
  title: {
    default: "Airdrop Farmer Manager | Track & Automate Your Farming",
    template: "%s | Airdrop Farmer Manager",
  },
  description:
    "The ultimate dashboard to track, manage, and automate your crypto airdrop farming operations across zkSync, Scroll, Base, and more. Sybil protection, wallet scoring, and auto-farming.",
  keywords: [
    "airdrop",
    "crypto",
    "farming",
    "tracker",
    "automation",
    "dashboard",
    "web3",
    "zksync",
    "scroll",
    "base",
    "sybil detection",
    "wallet management",
  ],
  authors: [{ name: "Airdrop Farmer Team", url: "https://airdrop-farmer.com" }],
  creator: "Airdrop Farmer Manager",
  publisher: "Airdrop Farmer Manager",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Airdrop Farmer Manager | Automate Your Crypto Airdrops",
    description:
      "Track 100+ wallets, analyze Sybil risk, and automate farming strategies on 7+ EVM chains. The professional tool for serious airdrop hunters.",
    url: "https://airdrop-farmer.com",
    siteName: "Airdrop Farmer Manager",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists in public/
        width: 1200,
        height: 630,
        alt: "Airdrop Farmer Manager Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Airdrop Farmer Manager",
    description: "Track & automate your crypto airdrop farming operations.",
    creator: "@airdropfarmer",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Airdrop Farmer Manager",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "description": "Professional dashboard for tracking and automating crypto airdrop farming.",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250",
  },
};

import { SupportWidget } from "@/components/layout/support-widget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ClerkProvider
            appearance={{
              baseTheme: dark,
              variables: { colorPrimary: "#6366f1" },
            }}
          >
            {children}
            <Analytics />
            <SupportWidget />
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
