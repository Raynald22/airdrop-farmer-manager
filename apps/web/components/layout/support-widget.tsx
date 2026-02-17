
"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
      }, 3000);
      toast.success("Message sent! We'll reply via email.");
    } catch (error) {
      toast.error("Failed to send message. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 mb-4 glass border-white/10 shadow-2xl shadow-primary/5 animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200">
          <CardHeader className="relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-primary/20 border-b border-white/5 py-4">
            <div className="absolute top-0 right-0 p-3">
              <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-primary flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <MessageCircle className="h-5 w-5 text-white" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-black"></span>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-white">Support Team</CardTitle>
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">Always Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-black/40 backdrop-blur-sm">
            {sent ? (
              <div className="h-48 flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                  <Send className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Message Delivered!</p>
                  <p className="text-xs text-zinc-500 max-w-[200px] mx-auto">
                    We usually reply within a few hours. Check your inbox for updates.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-zinc-400 ml-1">
                    How can we help you today?
                  </p>
                  <div className="relative">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="bg-zinc-900/50 border-white/10 text-sm h-11 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  size="sm" 
                  className="w-full h-10 gap-2 bg-gradient-to-r from-indigo-600 to-primary hover:from-indigo-500 hover:to-primary/90 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send to Support
                </Button>
                <p className="text-[10px] text-center text-zinc-600">
                  Powered by <span className="text-zinc-500 font-medium">Farmer Manager</span>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110",
          isOpen 
            ? "bg-zinc-800 hover:bg-zinc-700 rotate-90" 
            : "bg-gradient-to-tr from-indigo-600 to-primary hover:shadow-primary/50 animate-pulse-slow"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </Button>
    </div>
  );
}
