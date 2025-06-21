import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  overlay?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function Loading({
  size = "md",
  text = "Загрузка...",
  className,
  overlay = false,
}: LoadingProps) {
  const content = (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        overlay && "min-h-[200px]",
        className
      )}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Специальные варианты для частых случаев
export function LoadingSpinner({
  size = "md",
  className,
}: Pick<LoadingProps, "size" | "className">) {
  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
}

export function LoadingOverlay({ text }: Pick<LoadingProps, "text">) {
  return <Loading overlay text={text} />;
}

export function LoadingPage({
  text = "Загрузка страницы...",
}: Pick<LoadingProps, "text">) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  );
}
