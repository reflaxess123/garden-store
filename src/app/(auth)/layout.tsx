import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <Link href="/">
              {/* Placeholder for Logo */}
              <span className="text-2xl font-bold">Garden Store</span>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {children}
          <div className="mt-4 text-center text-sm">
            {/* Placeholder for Link-switcher */}
            <p>Auth links will go here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
