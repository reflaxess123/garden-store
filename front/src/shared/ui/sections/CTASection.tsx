"use client";

import { Button } from "@/shared/ui/button";
import { ArrowRight, Heart, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { ActionProps } from "./HeroSection";

const iconMap = {
  "arrow-right": ArrowRight,
  "shopping-bag": ShoppingBag,
  search: Search,
  user: User,
  heart: Heart,
};

export interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: ActionProps;
  secondaryAction?: ActionProps;
  bgClassName?: string;
  children?: ReactNode;
}

export default function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  bgClassName = "bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700",
  children,
}: CTASectionProps) {
  return (
    <section className={`py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-green-100 dark:text-green-200 mb-8">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size={primaryAction.size || "lg"}
              variant={primaryAction.variant || "secondary"}
            >
              <Link
                href={primaryAction.href}
                className="flex items-center gap-2"
              >
                {primaryAction.label}
                {primaryAction.iconName &&
                  (() => {
                    const Icon = iconMap[primaryAction.iconName];
                    return <Icon className="h-5 w-5" />;
                  })()}
              </Link>
            </Button>

            {secondaryAction && (
              <Button
                asChild
                size={secondaryAction.size || "lg"}
                variant={secondaryAction.variant || "outline"}
                className="border-white text-white hover:bg-white hover:text-green-600 dark:hover:text-green-700"
              >
                <Link
                  href={secondaryAction.href}
                  className="flex items-center gap-2"
                >
                  {secondaryAction.label}
                  {secondaryAction.iconName &&
                    (() => {
                      const Icon = iconMap[secondaryAction.iconName];
                      return <Icon className="h-5 w-5" />;
                    })()}
                </Link>
              </Button>
            )}
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
