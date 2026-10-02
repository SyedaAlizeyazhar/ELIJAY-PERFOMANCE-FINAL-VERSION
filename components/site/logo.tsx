"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * ELIJAY logo, drawn in code (no image): the open gold ring with the serif
 * "EJ" monogram, the wide-spaced ELIJAY wordmark and the emerald
 * PERFORMANCE PARTNERS line, finished with the gold rule and diamond.
 *
 *   <LogoMark />                    ring + monogram only
 *   <Logo />                        mark beside the wordmark (header)
 *   <Logo variant="stacked" />      mark above the wordmark (footer, hero)
 */

export function LogoMark({ className, glint = true }: { className?: string; glint?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" className={cn("h-11 w-11", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5D27A" />
          <stop offset="45%" stopColor="#D6A343" />
          <stop offset="100%" stopColor="#9E7424" />
        </linearGradient>
      </defs>
      {/* the ring is open at the bottom, like the original mark */}
      <path
        d="M27.5 88.3 A44 44 0 1 1 72.5 88.3"
        fill="none"
        stroke={`url(#g${id})`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <text
        x="50"
        y="63"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), Georgia, serif"
        fontWeight="600"
        fontSize="46"
        letterSpacing="-2"
        fill={`url(#g${id})`}
      >
        EJ
      </text>
      {glint && (
        <path
          className="logo-glint"
          d="M16 22 L17.2 26.8 L22 28 L17.2 29.2 L16 34 L14.8 29.2 L10 28 L14.8 26.8 Z"
          fill="#FFF3C9"
        />
      )}
    </svg>
  );
}

function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("h-3 w-3", className)} aria-hidden="true">
      <path d="M8 1 L15 8 L8 15 L1 8 Z" fill="#D6A343" />
      <path d="M8 4.5 L11.5 8 L8 11.5 L4.5 8 Z" fill="#050607" />
    </svg>
  );
}

export function Logo({
  variant = "inline",
  className,
}: {
  variant?: "inline" | "stacked";
  className?: string;
}) {
  if (variant === "stacked") {
    return (
      <span className={cn("inline-flex flex-col items-center text-center", className)}>
        <LogoMark className="h-20 w-20" />
        <span className="mt-2 font-serif text-4xl font-semibold uppercase leading-none tracking-[0.34em] text-gold-gradient">
          Elijay
        </span>
        <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.38em] text-emerald-teal">
          Performance Partners
        </span>
        <span className="mt-3 flex w-full items-center gap-2">
          <span className="thread flex-1" />
          <Diamond />
          <span className="thread flex-1" />
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark className="h-10 w-10 sm:h-11 sm:w-11" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[22px] font-semibold uppercase tracking-[0.3em] text-gold-gradient sm:text-2xl">
          Elijay
        </span>
        <span className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.3em] text-emerald-teal sm:text-[9px]">
          Performance Partners
        </span>
      </span>
    </span>
  );
}
