
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Bell, Save, Send } from "lucide-react";

export function NotificationSettings({ initialChatId }: { initialChatId: string | null }) {
    const [chatId, setChatId] = useState(initialChatId || "");
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);

    async function handleSave() {
        setLoading(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telegramChatId: chatId, action: "save" }),
            });
            
            if (res.ok) {
                toast.success("Settings saved successfully");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    async function handleTest() {
        if (!chatId) {
            toast.error("Please enter a Chat ID first");
            return;
        }

        setTesting(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ telegramChatId: chatId, action: "test" }),
            });
            
            if (res.ok) {
                toast.success("Test message sent! Check Telegram.");
            } else {
                toast.error("Failed to send test message");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setTesting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                </CardTitle>
                <CardDescription>
                    Receive real-time alerts about farming tasks and critical issues.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="telegram">Telegram Chat ID</Label>
                    <div className="flex gap-2">
                        <Input 
                            id="telegram" 
                            placeholder="e.g. 123456789" 
                            value={chatId}
                            onChange={(e) => setChatId(e.target.value)}
                        />
                        <Button variant="outline" size="icon" onClick={handleTest} disabled={testing} title="Send Test Message">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Start a chat with your bot and send <code>/start</code> to get your Chat ID. 
                        You can use userinfobot to find it.
                    </p>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Preferences</>}
                </Button>
            </CardContent>
        </Card>
    );
}
