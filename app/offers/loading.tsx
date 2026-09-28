import { Badge } from "@/components/ui/badge";
import { Skeleton, OfferCardSkeleton } from "@/components/site/skeleton";

/**
 * Shown instantly while the offers page fetches from KV.
 *
 * The page is force-dynamic (offers must never be stale), so every navigation
 * waits on a KV round trip. Without this file Next.js holds the old route on
 * screen and then swaps — which reads as a blink. The static parts render
 * immediately here, and only the data-dependent parts are skeletons.
 */
export default function Loading() {
  return (
    <div className="bg-hero-gradient">
      <div className="container py-20">
        <div className="max-w-2xl">
          <Badge variant="accent" className="mb-4">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            Live Network Feed
          </Badge>
          <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
            Live Verticals &amp; Offers
          </h1>
          <p className="mt-4 text-muted">
            Every campaign below is active right now. Payouts, geo-targeting,
            and caps update as buyer demand shifts — apply directly to the
            offers that match your traffic.
          </p>
        </div>

        <div className="mt-12">
          <div className="flex flex-wrap gap-2">
            {["w-28", "w-20", "w-24", "w-32", "w-24"].map((w, i) => (
              <Skeleton key={i} className={`h-10 rounded-full ${w}`} />
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <OfferCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
