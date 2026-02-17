
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { redirect } from "next/navigation";

export default async function ActivityPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch alerts/activity
  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100, // Limit to last 100 for now
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Activity</h1>
        <p className="text-muted-foreground">
          Real-time log of bot actions, task completions, and security alerts.
        </p>
      </div>

      <ActivityFeed initialAlerts={alerts} />
    </div>
  );
}
