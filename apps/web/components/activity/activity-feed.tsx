
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Bell, 
  Filter,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Alert = {
  id: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
};

interface ActivityFeedProps {
  initialAlerts: Alert[];
}

export function ActivityFeed({ initialAlerts }: ActivityFeedProps) {
  const [filter, setFilter] = useState<"all" | "success" | "warning" | "critical">("all");
  const [search, setSearch] = useState("");

  const filteredAlerts = initialAlerts.filter(alert => {
    const matchesFilter = filter === "all" || alert.priority === filter;
    const matchesSearch = alert.title.toLowerCase().includes(search.toLowerCase()) || 
                          alert.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getIcon = (priority: string) => {
    switch (priority) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "critical": return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning": return <Bell className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "success" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("success")}
            className={cn(filter === "success" && "bg-green-600 hover:bg-green-700")}
          >
            Success
          </Button>
          <Button 
            variant={filter === "critical" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("critical")}
            className={cn(filter === "critical" && "bg-red-600 hover:bg-red-700")}
          >
            Failed
          </Button>
           <Button 
            variant={filter === "warning" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("warning")}
          >
            Warnings
          </Button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search activity..." 
            className="pl-8" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Feed List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Activity Log
            <Badge variant="secondary" className="ml-auto">
              {filteredAlerts.length} Events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>No activity found matching your filters.</p>
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="flex gap-4 p-4 rounded-lg border bg-card/50 hover:bg-accent/5 transition-colors"
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(alert.priority)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm text-foreground">
                          {alert.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    )
}
