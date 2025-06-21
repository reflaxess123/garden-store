"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Quote, Star } from "lucide-react";
import { ReactNode } from "react";

export interface TestimonialItem {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: TestimonialItem[];
  bgClassName?: string;
  children?: ReactNode;
}

export default function TestimonialsSection({
  title,
  description,
  testimonials,
  bgClassName = "bg-muted/30",
  children,
}: TestimonialsSectionProps) {
  return (
    <section className={`py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-xl text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Quote className="h-8 w-8 text-green-600 mr-3" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {children}
      </div>
    </section>
  );
}
