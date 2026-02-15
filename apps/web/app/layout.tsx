import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Airdrop Farmer Manager | Crypto Wallet Tracking",
  description: "Track your crypto wallets, check airdrop eligibility, and monitor sybil status across zkSync, Scroll, Base, and more.",
  openGraph: {
    title: "Airdrop Farmer Manager",
    description: "The ultimate tool for multi-wallet airdrop farming.",
    url: "https://airdrop-farmer.com",
    siteName: "Airdrop Farmer",
    images: [
      {
        url: "https://airdrop-farmer.com/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

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
          </ClerkProvider>
        </Providers>
      </body>
    </html>
  );
}
