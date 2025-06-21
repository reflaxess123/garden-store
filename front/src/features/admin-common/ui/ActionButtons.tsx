"use client";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Eye, MoreHorizontal, Pencil, Trash } from "lucide-react";

export interface Action {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

export interface ActionButtonsProps {
  actions: Action[];
  layout?: "buttons" | "dropdown";
  className?: string;
}

export default function ActionButtons({
  actions,
  layout = "buttons",
  className = "",
}: ActionButtonsProps) {
  if (layout === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={
                  action.variant === "destructive" ? "text-destructive" : ""
                }
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={index}
            variant={
              action.variant === "destructive" ? "destructive" : "outline"
            }
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span className="sr-only">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Предустановленные действия для удобства
export const commonActions = {
  edit: (onClick: () => void): Action => ({
    label: "Редактировать",
    icon: Pencil,
    onClick,
  }),
  delete: (onClick: () => void): Action => ({
    label: "Удалить",
    icon: Trash,
    onClick,
    variant: "destructive" as const,
  }),
  view: (onClick: () => void): Action => ({
    label: "Просмотр",
    icon: Eye,
    onClick,
  }),
};
