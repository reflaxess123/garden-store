import React from "react";

interface CatalogGridProps {
  children: React.ReactNode;
}

export function CatalogGrid({ children }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
