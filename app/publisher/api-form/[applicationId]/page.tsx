import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/site/motion-wrap";
import { CopyValue } from "@/components/site/copy-value";
import { ApiPingForm } from "@/components/forms/api-ping-form";
import { getPublisherSession } from "@/lib/publisher-auth";
import { getPublisherOffer } from "@/lib/publishers";
import { PLATFORM_FIELDS } from "@/lib/types";

export const metadata: Metadata = { title: "API Form", robots: { index: false } };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ApiFormPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const publisher = await getPublisherSession();
  if (!publisher) {
    redirect(
      `/publisher-login?next=${encodeURIComponent(`/publisher/api-form/${params.applicationId}`)}`
    );
  }

  let offer;
  try {
    offer = await getPublisherOffer(publisher.username, params.applicationId);
  } catch {
    offer = null;
  }
  if (!offer || offer.status !== "Accepted") notFound();

  const platform = offer.platform;
  const fields = platform ? PLATFORM_FIELDS[platform] : null;
  const ready =
    !!platform && !!offer.platformId && (platform !== "Retreaver" || !!offer.publisherId);

  return (
    <div className="bg-hero-gradient">
      <div className="container py-16 md:py-24">
        <FadeUp>
          <Link
            href="/publisher"
            className="inline-flex items-center gap-2 text-sm text-gold/80 transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> My Dashboard
          </Link>
          <Badge variant="accent" className="mb-5 mt-8 flex w-fit">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            API Form
          </Badge>
          <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
            Test your <span className="text-gold-gradient">{offer.offerTitle || "offer"}</span> ping
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Send a test ping to the buyer&apos;s endpoint before going live. Your
            routing details are already filled in — just add a test caller.
          </p>
        </FadeUp>

        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <FadeUp>
            <h2 className="font-display text-lg font-semibold text-foreground">Your Routing</h2>
            <div className="thread mt-3" />
            <div className="mt-6 grid gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Platform
                </p>
                <p className="mt-1 font-display text-lg font-semibold text-gold">
                  {platform || "Being set up"}
                </p>
              </div>
              {fields && offer.platformId && (
                <CopyValue label={`${fields.id} for this offer`} value={offer.platformId} />
              )}
              {fields?.publisherId && offer.publisherId && (
                <CopyValue label={fields.publisherId} value={offer.publisherId} />
              )}
              {offer.did && <CopyValue label="DID" value={offer.did} />}
            </div>
          </FadeUp>

          <FadeUp>
            <h2 className="font-display text-lg font-semibold text-foreground">Test Caller</h2>
            <div className="thread mt-3" />
            <div className="mt-6">
              {ready && platform ? (
                <ApiPingForm applicationId={offer.applicationId} platform={platform} />
              ) : (
                <p className="text-sm leading-relaxed text-muted">
                  Your routing for this offer is still being set up. Once our team
                  adds your platform details, you can send a test ping from here.
                </p>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
