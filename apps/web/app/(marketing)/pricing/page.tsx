
import { PricingCards } from "@/components/pricing/pricing-cards";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export default async function PricingPage() {
  const user = await currentUser();
  let currentTier = "free";

  if (user) {
      const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { tier: true }
      });
      if (dbUser) {
          currentTier = dbUser.tier;
      }
  }

  return (
    <div className="py-24 sm:py-32 relative">
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <a href="/" className="text-muted-foreground hover:text-foreground text-sm font-medium">
          Close
        </a>
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the right tools for your airdrop farming strategy. 
            Scale from manual tracking to full automation.
          </p>
        </div>
        
        <PricingCards currentTier={currentTier} />
      </div>
    </div>
  );
}
