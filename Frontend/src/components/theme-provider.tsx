"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "plainspeak-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      storageKey={storageKey}
    >
      {children}
    </NextThemesProvider>
  );
}
