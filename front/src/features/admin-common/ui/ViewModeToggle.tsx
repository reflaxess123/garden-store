"use client";

import { Button } from "@/shared/ui/button";
import { Grid, List, Table } from "lucide-react";

export type ViewMode = "table" | "grid" | "list";

export interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  modes?: ViewMode[];
  className?: string;
}

const modeConfig: Record<
  ViewMode,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }
> = {
  table: {
    icon: Table,
    label: "Таблица",
  },
  grid: {
    icon: Grid,
    label: "Плитка",
  },
  list: {
    icon: List,
    label: "Список",
  },
};

export default function ViewModeToggle({
  currentMode,
  onModeChange,
  modes = ["table", "grid"],
  className = "",
}: ViewModeToggleProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {modes.map((mode) => {
        const config = modeConfig[mode];
        const Icon = config.icon;

        return (
          <Button
            key={mode}
            variant={currentMode === mode ? "default" : "outline"}
            size="sm"
            onClick={() => onModeChange(mode)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
