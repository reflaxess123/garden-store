"use client";

import { useSession } from "@/shared/lib/useSession";
import { useRouter } from "next/navigation";
import React from "react";

// Placeholder for a loading component. You can replace this with a proper skeleton or spinner.
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated && !isLoading) {
    // Redirect to login page with callback for current path
    const currentPath = window.location.pathname + window.location.search;
    router.replace(`/login?callback=${encodeURIComponent(currentPath)}`);
    return null; // Don't render children until authenticated or redirected
  }

  if (!isAuthenticated && isLoading) {
    return null; // Don't render anything while loading and not authenticated
  }

  return <>{children}</>;
}
