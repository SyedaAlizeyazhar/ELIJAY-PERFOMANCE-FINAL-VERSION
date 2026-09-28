"use client";

import type { ReactNode } from "react";

/**
 * Section wrappers.
 *
 * These used to fade content in with `whileInView`, which meant every element
 * mounted at opacity 0 and waited for an IntersectionObserver callback before
 * becoming visible. On a fresh page load or a client-side navigation that
 * leaves the whole page blank for a frame or two, then pops — which is the
 * "blink" on every route, not just the dynamic ones.
 *
 * Content now renders immediately. The components are kept (rather than
 * deleted) so every existing import and `delay`/`stagger` prop keeps
 * compiling; they're plain layout divs now.
 */

export function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  /** Accepted for compatibility; no longer used. */
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  /** Accepted for compatibility; no longer used. */
  stagger?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
