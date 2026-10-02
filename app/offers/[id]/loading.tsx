import { Skeleton } from "@/components/site/skeleton";

/** Mirrors the offer detail two-column layout while KV resolves. */
export default function Loading() {
  return (
    <div className="bg-hero-gradient">
      <div className="container grid gap-10 py-12 md:py-20 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="mt-4 h-10 w-4/5" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-11/12" />
          <Skeleton className="mt-2 h-3 w-3/4" />

          <div className="mt-8 grid grid-cols-1 gap-5 rounded-2xl sm:grid-cols-2 border border-border bg-panel p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-5 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-panel p-6 md:p-8">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="mt-2 h-3 w-72" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-11 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
