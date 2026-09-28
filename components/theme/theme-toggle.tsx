"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sun/Moon switch with a gold knob that springs between the two ends. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before hydration the theme is unknown; render the dark default so the
  // server and first client render match.
  const dark = !mounted || resolvedTheme !== "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-[60px] shrink-0 items-center rounded-full border border-gold/40 bg-panel/80 px-1 transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        dark ? "justify-end" : "justify-start",
        className
      )}
    >
      <Sun className="absolute left-2 h-3.5 w-3.5 text-gold/60" aria-hidden="true" />
      <Moon className="absolute right-2 h-3.5 w-3.5 text-gold/60" aria-hidden="true" />
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
        className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#D6A343] shadow-gold"
      >
        <motion.span
          key={dark ? "moon" : "sun"}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
        >
          {dark ? (
            <Moon className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-ink" aria-hidden="true" />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}
