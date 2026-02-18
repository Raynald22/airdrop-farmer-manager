
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";

interface SettingsData {
    maxGwei: number;
    minBalance: string;
    tradingEnabled: boolean;
}

export function BotSettingsDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<SettingsData>({
        maxGwei: 30,
        minBalance: "0.001",
        tradingEnabled: true
    });

    useEffect(() => {
        if (open) fetchSettings();
    }, [open]);

    async function fetchSettings() {
        setLoading(true);
        try {
            const res = await fetch("/api/user/settings");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch("/api/user/settings", {
                method: "PATCH",
                body: JSON.stringify(data)
            });
            if (res.ok) {
                setOpen(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 w-full rounded-md transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Bot Settings</span>
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bot Configuration</DialogTitle>
                    <DialogDescription>
                        Customize how the auto-farming bot operates.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="space-y-6 py-4">
                        {/* Max Gwei */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <Label>Max Gas Price (Gwei)</Label>
                                <span className="text-sm font-mono text-primary">{data.maxGwei} Gwei</span>
                            </div>
                            <input 
                                type="range"
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                min="5"
                                max="100"
                                value={data.maxGwei}
                                onChange={(e) => setData({...data, maxGwei: parseInt(e.target.value)})}
                            />
                            <p className="text-xs text-muted-foreground">Bot will pause if network gas exceeds this value.</p>
                        </div>

                        {/* Min Balance */}
                        <div className="space-y-2">
                            <Label>Minimum ETH Balance</Label>
                            <div className="relative">
                                <Input 
                                    value={data.minBalance}
                                    onChange={(e) => setData({...data, minBalance: e.target.value})}
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">ETH</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Safety buffer. Bot won't spend below this amount.</p>
                        </div>

                        {/* Switch (Native Checkbox) */}
                        <div className="flex items-center justify-between border p-3 rounded-lg bg-card/50">
                            <div className="space-y-0.5">
                                <Label htmlFor="trading-switch">Master Switch</Label>
                                <p className="text-xs text-muted-foreground">Enable/Disable all farming activities.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    id="trading-switch"
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={data.tradingEnabled}
                                    onChange={(e) => setData({...data, tradingEnabled: e.target.checked})}
                                />
                                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <Button onClick={handleSave} className="w-full" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
