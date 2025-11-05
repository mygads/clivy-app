"use client";

import { MyAddonStats } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  Package,
  TrendingUp
} from "lucide-react";

interface MyAddonStatsCardsProps {
  stats: MyAddonStats;
  loading: boolean;
}

export function MyAddonStatsCards({ stats, loading }: MyAddonStatsCardsProps) {
  const cards = [
    {
      title: "Total Addons",
      value: stats.total,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      description: "All purchased addons",
    },
    {
      title: "Complete",
      value: stats.complete,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      description: "Successfully delivered",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      description: "Awaiting delivery",
    },
    {
      title: "In Progress",
      value: stats.inprogress,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      description: "Currently processing",
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-2 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-2 sm:h-3 md:h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 sm:w-16 md:w-20 mb-1 sm:mb-2"></div>
                  <div className="h-4 sm:h-6 md:h-8 bg-gray-200 dark:bg-gray-700 rounded w-6 sm:w-8 md:w-12"></div>
                </div>
                <div className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="animate-in fade-in-0 duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className="border border-border hover:shadow-md transition-all duration-200 hover:border-primary/20">
              <CardContent className="p-2 sm:p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate">
                      {card.title}
                    </p>
                    <div className="flex items-baseline space-x-1 sm:space-x-2">
                      <p className="text-sm sm:text-lg md:text-2xl font-bold text-foreground">
                        {card.value}
                      </p>
                    </div>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground truncate">
                      {card.description}
                    </p>
                  </div>
                  <div className={`p-1 sm:p-2 md:p-3 rounded-full ${card.bgColor} flex-shrink-0`}>
                    <Icon className={`h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
