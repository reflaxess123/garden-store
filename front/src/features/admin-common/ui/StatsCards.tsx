"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatCard {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export interface StatsCardsProps {
  stats: StatCard[];
  className?: string;
  columns?: 2 | 3 | 4;
}

export default function StatsCards({
  stats,
  className = "",
  columns = 4,
}: StatsCardsProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]} ${className}`}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {(stat.description || stat.trend) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {stat.trend && (
                        <div
                          className={`flex items-center gap-1 ${
                            stat.trend.isPositive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.trend.isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(stat.trend.value)}%
                        </div>
                      )}
                      {stat.description && <span>{stat.description}</span>}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
