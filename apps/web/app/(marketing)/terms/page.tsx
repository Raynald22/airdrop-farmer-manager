
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Airdrop Farmer Manager",
  description: "Terms of Service for Airdrop Farmer Manager",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Agreement to Terms</h2>
        <p>
          By accessing or using the Airdrop Farmer Manager website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on Airdrop Farmer Manager's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Disclaimer</h2>
        <div className="bg-destructive/10 p-4 rounded-lg border-l-4 border-destructive text-destructive-foreground">
          <p className="font-medium">Risk Warning</p>
          <p className="text-sm mt-1">
            Cryptocurrency trading and airdrop farming involve significant risk. Airdrop Farmer Manager provides tools for tracking and automation but does not guarantee any profits or specific airdrop allocations. You use the software at your own risk. We are not responsible for any loss of funds due to hacks, smart contract bugs, or user error.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Limitations</h2>
        <p>
          In no event shall Airdrop Farmer Manager or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Airdrop Farmer Manager's website.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Delaware, USA and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </section>
    </div>
  );
}
