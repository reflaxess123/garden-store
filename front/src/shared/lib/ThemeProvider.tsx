"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ComponentProps, ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: ComponentProps<typeof NextThemesProvider>["attribute"];
  defaultTheme?: ComponentProps<typeof NextThemesProvider>["defaultTheme"];
  enableSystem?: ComponentProps<typeof NextThemesProvider>["enableSystem"];
  disableTransitionOnChange?: ComponentProps<
    typeof NextThemesProvider
  >["disableTransitionOnChange"];
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
