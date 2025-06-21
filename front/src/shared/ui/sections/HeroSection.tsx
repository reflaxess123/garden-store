"use client";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

export interface ActionProps {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export interface StatProps {
  value: string | number;
  label: string;
  color?: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export interface HeroSectionProps {
  badge?: {
    text: string;
    className?: string;
  };
  title: string;
  subtitle?: string;
  description: string;
  primaryAction: ActionProps;
  secondaryAction?: ActionProps;
  image: ImageProps;
  stats?: StatProps[];
  bgClassName?: string;
  children?: ReactNode;
}

export default function HeroSection({
  badge,
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  image,
  stats,
  bgClassName = "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950",
  children,
}: HeroSectionProps) {
  return (
    <section className={`relative ${bgClassName} py-20 lg:py-32`}>
      <div className="absolute inset-0 bg-[url('/images/garden-pattern.svg')] opacity-5"></div>
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              {badge && <Badge className={badge.className}>{badge.text}</Badge>}

              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {title}
                {subtitle && (
                  <>
                    {" "}
                    <span className="text-green-600 dark:text-green-400">
                      {subtitle}
                    </span>
                  </>
                )}
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size={primaryAction.size || "lg"}
                variant={primaryAction.variant}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <Link
                  href={primaryAction.href}
                  className="flex items-center gap-2"
                >
                  {primaryAction.label}
                  {primaryAction.icon && (
                    <primaryAction.icon className="h-5 w-5" />
                  )}
                </Link>
              </Button>

              {secondaryAction && (
                <Button
                  asChild
                  variant={secondaryAction.variant || "outline"}
                  size={secondaryAction.size || "lg"}
                >
                  <Link
                    href={secondaryAction.href}
                    className="flex items-center gap-2"
                  >
                    {secondaryAction.label}
                    {secondaryAction.icon && (
                      <secondaryAction.icon className="h-5 w-5" />
                    )}
                  </Link>
                </Button>
              )}
            </div>

            {/* Статистика */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`text-2xl lg:text-3xl font-bold ${
                        stat.color || "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 600}
                height={image.height || 500}
                className="rounded-2xl shadow-2xl"
                priority={image.priority || true}
              />
            </div>
            {/* Декоративные элементы */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-200 dark:bg-green-800 rounded-full opacity-60"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-emerald-200 dark:bg-emerald-800 rounded-full opacity-40"></div>
          </div>
        </div>

        {children}
      </div>
    </section>
  );
}
