import { cn } from "@/lib/utils";

/**
 * Shimmerless skeleton block.
 *
 * A plain pulse rather than a moving gradient — the pages that use these are
 * dynamic and usually resolve in well under a second, and a sweeping shimmer
 * at that length reads as a glitch rather than as loading.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-foreground/[0.06]", className)}
      aria-hidden="true"
    />
  );
}

/** Matches the shape of a real offer card so the swap isn't a jump. */
export function OfferCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />

      <div className="mt-5 flex flex-wrap gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-9" />
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-4">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <Skeleton className="mt-5 h-9 w-full rounded-xl" />
    </div>
  );
}
