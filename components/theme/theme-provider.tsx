"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useRef, type ReactNode } from "react";
import { Toaster } from "sonner";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      // Dark only: forcedTheme also overrides a "light" choice saved in
      // localStorage from when the toggle existed.
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Canvas animations read the theme every frame, so they get it through a ref
 * rather than a dependency — switching themes recolours them without tearing
 * down and restarting the animation loop.
 */
export function useIsDarkRef() {
  const { resolvedTheme, forcedTheme } = useTheme();
  const theme = forcedTheme ?? resolvedTheme;
  const ref = useRef(true);
  useEffect(() => {
    ref.current = theme !== "light";
  }, [theme]);
  return ref;
}

export function ThemedToaster() {
  const { resolvedTheme, forcedTheme } = useTheme();
  const dark = (forcedTheme ?? resolvedTheme) !== "light";
  return (
    <Toaster
      theme={dark ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: dark ? "#141716" : "#FFFFFF",
          border: "1px solid #D6A343",
          color: dark ? "#F4F1E8" : "#050607",
        },
      }}
    />
  );
}
