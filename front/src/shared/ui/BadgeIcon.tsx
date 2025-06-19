import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import React from "react";

interface BadgeIconProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
}

export function BadgeIcon({
  count,
  className,
  children,
  ...props
}: BadgeIconProps) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 h-5 w-5 justify-center rounded-full p-0 text-xs"
        >
          {count}
        </Badge>
      )}
    </div>
  );
}
