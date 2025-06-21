"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
  bg?: string;
}

export interface FeaturesSectionProps {
  title: string;
  description: string;
  features: FeatureItem[];
  bgClassName?: string;
  children?: ReactNode;
}

export default function FeaturesSection({
  title,
  description,
  features,
  bgClassName = "bg-background",
  children,
}: FeaturesSectionProps) {
  return (
    <section className={`py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-8">
                <div
                  className={`inline-flex p-4 rounded-full ${
                    feature.bg || "bg-primary/10"
                  } mb-6`}
                >
                  <feature.icon
                    className={`h-8 w-8 ${feature.color || "text-primary"}`}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {children}
      </div>
    </section>
  );
}
