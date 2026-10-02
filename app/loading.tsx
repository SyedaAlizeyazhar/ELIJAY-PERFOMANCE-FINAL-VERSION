import { Skeleton } from "@/components/site/skeleton";

/**
 * Home is force-dynamic too (it previews live offers from KV), so it gets the
 * same treatment. Only the hero block is sketched — by the time a visitor
 * scrolls further the real page has long since resolved.
 */
export default function Loading() {
  return (
    <div className="bg-hero-gradient">
      <div className="container py-24 md:py-32">
        <Skeleton className="h-7 w-56 rounded-full" />
        <Skeleton className="mt-6 h-12 w-full max-w-3xl" />
        <Skeleton className="mt-3 h-12 w-2/3 max-w-2xl" />
        <Skeleton className="mt-6 h-4 w-72" />
        <Skeleton className="mt-6 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-2xl" />

        <div className="mt-9 flex gap-4">
          <Skeleton className="h-12 w-56 rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-panel p-5">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="mt-3 h-7 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
