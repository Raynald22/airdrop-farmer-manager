
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { Leaderboard } from "@/components/scoring/leaderboard";
import { redirect } from "next/navigation";

export default async function ScoringPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const wallets = await prisma.wallet.findMany({
        where: { userId },
        include: { stats: true }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Scoring Analysis</h1>
                <p className="text-muted-foreground">
                    Evaluate your wallets based on transaction volume, count, and age.
                </p>
            </div>

            <Leaderboard wallets={wallets} />
        </div>
    );
}
