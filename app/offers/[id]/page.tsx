import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/site/motion-wrap";
import { OfferApplyForm } from "@/components/forms/offer-apply-form";
import { GeoChips, ListChips } from "@/components/site/geo-chips";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { getOfferById } from "@/lib/kv";
import { getPublisherSession } from "@/lib/publisher-auth";
import { getPublisherOffers } from "@/lib/publishers";
import type { PublisherOffer } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Offer", robots: { index: false } };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function OfferDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const publisher = await getPublisherSession();
  if (!publisher) {
    redirect(`/publisher-login?next=${encodeURIComponent(`/offers/${params.id}`)}`);
  }

  let offer;
  let existing: PublisherOffer | undefined;
  try {
    const [found, applications] = await Promise.all([
      getOfferById(params.id),
      getPublisherOffers(publisher.username),
    ]);
    offer = found;
    // Latest application to this offer, if any (list is newest first).
    existing = applications.find((a) => a.offerId === params.id);
  } catch {
    offer = undefined;
  }

  if (!offer || offer.status !== "active") {
    notFound();
  }

  return (
    <div className="bg-hero-gradient">
      <div className="container grid gap-10 py-12 md:py-20 lg:grid-cols-[1fr_1.2fr]">
        <FadeUp>
          <Badge variant="accent" className="mb-4">
            {offer.vertical}
          </Badge>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
            {offer.title}
          </h1>
          <p className="mt-4 leading-relaxed text-muted">{offer.description}</p>

          <Card className="mt-8">
            <CardContent className="grid grid-cols-1 gap-5 p-6 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Payout</p>
                <p className="mt-1 font-display text-lg font-semibold text-gold">
                  {offer.payout}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Geo</p>
                <GeoChips geo={offer.geo} className="mt-2" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Cap</p>
                <p className="mt-1 font-medium text-foreground">{offer.cap}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Schedule</p>
                <p className="mt-1 font-medium text-foreground">{offer.schedule}</p>
              </div>
              {offer.breakHours && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Break Hours</p>
                  <p className="mt-1 font-medium text-foreground">{offer.breakHours}</p>
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Payment Terms</p>
                <p className="mt-1 font-medium text-foreground">{offer.paymentTerms || "—"}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-muted">Allowed Traffic</p>
                <ListChips geo={offer.allowedTraffic} className="mt-2" />
              </div>
            </CardContent>
          </Card>

          {offer.resources && offer.resources.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted">
                  Offer Resources
                </p>
                <div className="flex flex-wrap gap-3">
                  {offer.resources.map((r) => (
                    <Button
                      key={r.url}
                      asChild
                      size="sm"
                      variant="outline"
                    >
                      {/* noreferrer on outbound partner links */}
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        {r.label} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </FadeUp>

        <FadeUp delay={0.1}>
          <Card>
            <CardContent className="p-6 md:p-8">
              {existing && existing.status !== "Rejected" ? (
                // Already applied: show where it stands instead of the form.
                <div>
                  <p
                    className={
                      existing.status === "Accepted"
                        ? "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-teal"
                        : "text-xs font-semibold uppercase tracking-[0.18em] text-gold"
                    }
                  >
                    {existing.status === "Accepted" ? "Accepted" : "Under review"}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-foreground">
                    {existing.status === "Accepted"
                      ? "This offer is active for you"
                      : "Your application is with our team"}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {existing.status === "Accepted"
                      ? "Your DID, platform ID and API form are on your dashboard."
                      : "We'll review your traffic and update your dashboard once a decision is made."}
                  </p>
                  <Button asChild variant="thread" className="mt-4">
                    <Link href="/publisher">Go to My Dashboard</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Apply for This Offer
                  </h2>
                  <p className="mt-1 mb-6 text-sm text-muted">
                    Tell us about your traffic — our team reviews every application.
                  </p>
                  <OfferApplyForm
                    offerId={offer.id}
                    offerTitle={offer.title}
                    defaultCompanyName={publisher.companyName}
                    defaultCompanyEmail={publisher.email}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
