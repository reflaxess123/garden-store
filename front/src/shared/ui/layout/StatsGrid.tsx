"use client";

import { Award, ShoppingBag, Users } from "lucide-react";
import { ReactNode } from "react";

const iconMap = {
  users: Users,
  "shopping-bag": ShoppingBag,
  award: Award,
};

export interface StatItem {
  iconName: "users" | "shopping-bag" | "award";
  value: string | number;
  label: string;
  color?: string;
  description?: string;
}

export interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  bgClassName?: string;
  textColor?: string;
  size?: "sm" | "default" | "lg";
  children?: ReactNode;
}

export default function StatsGrid({
  stats,
  columns = 4,
  bgClassName = "bg-primary",
  textColor = "text-white",
  size = "default",
  children,
}: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
  };

  const sizeClasses = {
    sm: {
      icon: "h-8 w-8",
      value: "text-2xl lg:text-3xl",
      label: "text-sm",
    },
    default: {
      icon: "h-12 w-12",
      value: "text-4xl lg:text-5xl",
      label: "text-lg",
    },
    lg: {
      icon: "h-16 w-16",
      value: "text-5xl lg:text-6xl",
      label: "text-xl",
    },
  };

  return (
    <section className={`py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4">
        <div className={`grid ${gridCols[columns]} gap-8`}>
          {stats.map((stat, index) => (
            <div key={index} className={`text-center ${textColor}`}>
              {(() => {
                const Icon = iconMap[stat.iconName];
                return (
                  <Icon
                    className={`${sizeClasses[size].icon} mx-auto mb-4 opacity-80`}
                  />
                );
              })()}
              <div
                className={`${sizeClasses[size].value} font-bold mb-2 ${
                  stat.color || ""
                }`}
              >
                {stat.value}
              </div>
              <div className={`${sizeClasses[size].label} opacity-90`}>
                {stat.label}
              </div>
              {stat.description && (
                <div className="text-sm opacity-70 mt-1">
                  {stat.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {children}
      </div>
    </section>
  );
}
