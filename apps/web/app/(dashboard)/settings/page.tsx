
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubscriptionStatus } from "@/components/settings/subscription-status";
import { NotificationSettings } from "@/components/settings/notifications";

export default async function SettingsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch db user for telegramChatId
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { telegramChatId: true }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal information from the authentication provider.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="h-16 w-16 rounded-full border"
                />
              )}
              <div>
                <p className="font-medium">{user.fullName || "User"}</p>
                <p className="text-sm text-muted-foreground">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>User ID</Label>
              <Input value={user.id} readOnly className="bg-muted font-mono" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <NotificationSettings initialChatId={dbUser?.telegramChatId || ""} />

        {/* Subscription Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Manage your billing and plan limits.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SubscriptionStatus />
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button variant="destructive" disabled>Delete Account</Button>
             <p className="text-xs text-muted-foreground mt-2">
                Deleting your account will remove all tracked wallets and history.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
