"use client";

import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { ReactNode } from "react";

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // Дополнительные элементы управления
  createButton?: {
    label?: string;
    onClick: () => void;
    loading?: boolean;
  };
  actions?: ReactNode; // Дополнительные кнопки действий
}

export default function AdminPageHeader({
  title,
  description,
  children,
  createButton,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Дополнительные элементы */}
        {children}

        {/* Кнопка создания */}
        {createButton && (
          <Button
            onClick={createButton.onClick}
            disabled={createButton.loading}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {createButton.label || "Создать"}
          </Button>
        )}

        {/* Дополнительные действия */}
        {actions}
      </div>
    </div>
  );
}
