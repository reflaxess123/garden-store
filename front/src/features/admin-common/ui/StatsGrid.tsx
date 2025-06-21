"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface StatCard {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface StatsGridProps {
  cards: StatCard[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
  children?: ReactNode;
}

export default function StatsGrid({
  cards,
  loading = false,
  columns = 4,
  children,
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : card.value}
            </div>
            {card.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            )}
            {card.trend && (
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs font-medium ${
                    card.trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {card.trend.isPositive ? "+" : ""}
                  {card.trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">
                  от прошлого месяца
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {children}
    </div>
  );
}
