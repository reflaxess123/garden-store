"use client";

import { ReactNode } from "react";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: ReactNode;
}

export default function LoadingState({
  title = "Загрузка...",
  description,
  size = "default",
  className = "",
  children,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const textSizeClasses = {
    sm: "text-base",
    default: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] text-center ${className}`}
    >
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary mb-4`}
      ></div>

      <p className={`${textSizeClasses[size]} font-medium text-foreground`}>
        {title}
      </p>

      {description && (
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      )}

      {children}
    </div>
  );
}
