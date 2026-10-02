import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";

/** Shown in place of offers to anyone who isn't a logged-in, approved publisher. */
export function OffersLocked({ next = "/offers" }: { next?: string }) {
  return (
    <div className="text-center">
      <div className="thread" />
      <div className="px-2 py-12 sm:py-16">
        <span className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-live rounded-full border border-gold/30" />
          <span className="absolute inset-2 rounded-full border border-gold/50" />
          <Lock className="h-5 w-5 text-gold" />
        </span>
        <h3 className="font-display text-2xl font-semibold text-foreground">
          Offers are for approved publishers
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          Apply as a publisher and our team will review your traffic. Once
          approved, you&apos;ll receive a username and password to access every
          live offer.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-x-8 gap-y-4 sm:flex-row">
          <Button asChild size="lg" className="pr-5">
            <Link href="/apply-as-publisher">
              Apply as a Publisher <ArrowOrb />
            </Link>
          </Button>
          <Button asChild size="lg" variant="thread">
            <Link href={`/publisher-login?next=${encodeURIComponent(next)}`}>
              Publisher Login
            </Link>
          </Button>
        </div>
      </div>
      <div className="thread" />
    </div>
  );
}
