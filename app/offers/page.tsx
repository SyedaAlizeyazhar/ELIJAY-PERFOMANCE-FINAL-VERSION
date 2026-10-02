import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/site/motion-wrap";
import { OffersGrid } from "@/components/site/offers-grid";
import { OffersLocked } from "@/components/site/offers-locked";
import { PublisherLogout } from "@/components/site/publisher-logout";
import { getActiveOffers, getVerticals } from "@/lib/kv";
import { getPublisherSession } from "@/lib/publisher-auth";

export const metadata: Metadata = {
  title: "Live Offers",
  description: "Live pay-per-call verticals and offers, available to approved ELIJAY publishers.",
  alternates: { canonical: "/offers" },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function OffersPage() {
  // Offers are only loaded for approved, logged-in publishers.
  const publisher = await getPublisherSession();

  let offers: Awaited<ReturnType<typeof getActiveOffers>> = [];
  let verticals: Awaited<ReturnType<typeof getVerticals>> = [];
  if (publisher) {
    try {
      [offers, verticals] = await Promise.all([getActiveOffers(), getVerticals()]);
    } catch {
      offers = [];
      verticals = [];
    }
  }

  return (
    <div className="bg-hero-gradient">
      <div className="container py-20">
        <FadeUp className="max-w-2xl">
          <Badge variant="accent" className="mb-4">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            Live Network Feed
          </Badge>
          <h1 className="font-display text-3xl font-semibold leading-[1.08] text-foreground md:text-[2.75rem]">
            Live verticals{" "}
            <span className="font-serif text-[1.1em] font-medium italic text-gold-gradient">&amp; offers.</span>
          </h1>
          <p className="mt-4 text-muted">
            Every campaign below is active right now. Payouts, geo-targeting,
            and caps update as buyer demand shifts — apply directly to the
            offers that match your traffic.
          </p>
        </FadeUp>

        {publisher ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
              <p className="text-sm text-foreground">
                Welcome,{" "}
                <span className="font-semibold text-gold">
                  {publisher.companyName || publisher.username}
                </span>
              </p>
              <Link
                href="/publisher"
                className="text-sm text-gold underline-offset-4 hover:underline"
              >
                My Dashboard
              </Link>
              <PublisherLogout username={publisher.username} />
            </div>
            <div className="mt-10">
              <OffersGrid offers={offers} verticals={verticals} />
            </div>
          </>
        ) : (
          <div className="mt-12">
            <OffersLocked />
          </div>
        )}
      </div>
    </div>
  );
}
