"use client";

import { Button } from "@/shared/ui/button";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] text-center ${className}`}
    >
      <div className="bg-muted/50 rounded-full p-8 mb-6">
        <Icon className="h-16 w-16 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-semibold mb-2 text-foreground">{title}</h2>

      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          size={action.size || "lg"}
        >
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
