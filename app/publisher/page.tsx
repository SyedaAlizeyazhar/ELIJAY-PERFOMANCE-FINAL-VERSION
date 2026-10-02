import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { FadeUp } from "@/components/site/motion-wrap";
import { PublisherLogout } from "@/components/site/publisher-logout";
import { CopyValue } from "@/components/site/copy-value";
import { ApiTesterDemo } from "@/components/site/api-tester-demo";
import { getPublisherSession } from "@/lib/publisher-auth";
import { getPublisherOffers } from "@/lib/publishers";
import { cn } from "@/lib/utils";
import { PLATFORM_FIELDS, type PublisherOffer } from "@/lib/types";

export const metadata: Metadata = { title: "Publisher Dashboard", robots: { index: false } };

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const STATUS_STYLE: Record<PublisherOffer["status"], string> = {
  Pending: "text-gold",
  Accepted: "text-emerald-teal",
  Rejected: "text-danger",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function PublisherDashboardPage() {
  const publisher = await getPublisherSession();
  if (!publisher) redirect("/publisher-login?next=/publisher");

  let applications: PublisherOffer[] = [];
  try {
    applications = await getPublisherOffers(publisher.username);
  } catch {
    applications = [];
  }
  const active = applications.filter((a) => a.status === "Accepted");
  const others = applications.filter((a) => a.status !== "Accepted");
  const name = publisher.companyName || publisher.username;

  return (
    <div className="bg-hero-gradient">
      <div className="container py-16 md:py-24">
        <FadeUp>
          <Badge variant="accent" className="mb-5">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            Publisher Dashboard
          </Badge>
          <h1 className="font-display text-3xl font-semibold text-foreground md:text-[2.75rem]">
            Welcome, <span className="text-gold-gradient">{name}</span>
          </h1>
          <div className="mt-5">
            <PublisherLogout username={publisher.username} />
          </div>
        </FadeUp>

        {/* ACTIVE OFFERS — accepted applications with their routing details */}
        <section className="mt-16">
          <FadeUp>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Your Active Offers
              </h2>
              <span className="font-display text-3xl font-semibold text-gold">
                {String(active.length).padStart(2, "0")}
              </span>
            </div>
            <div className="thread mt-4" />
          </FadeUp>

          {active.length === 0 ? (
            <p className="py-10 text-sm leading-relaxed text-muted">
              No active offers yet. Once our team accepts one of your
              applications and sets up your routing, its DID, platform ID and
              API form will appear here.
            </p>
          ) : (
            active.map((a) => {
              const fields = a.platform ? PLATFORM_FIELDS[a.platform] : null;
              const hasRouting = !!(a.did || a.platformId || a.apiInfo);
              return (
              <FadeUp key={a.applicationId}>
                <div className="ledger-row grid gap-6 py-7 md:grid-cols-[1.1fr_2fr]">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-teal">
                      <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
                      Active{a.platform && <span className="text-muted">· {a.platform}</span>}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                      {a.offerTitle || "Offer"}
                    </h3>
                    {a.offerId && (
                      <Link href={`/offers/${a.offerId}`} className="mt-1 inline-block text-xs text-gold/80 underline-offset-4 hover:underline">
                        View offer details
                      </Link>
                    )}
                    {fields && a.platformId && (
                      <Button asChild size="sm" className="mt-5 flex w-fit pr-3">
                        <Link href={`/publisher/api-form/${a.applicationId}`}>
                          API Form <ArrowOrb />
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-3">
                    {a.did ? <CopyValue label="DID" value={a.did} /> : null}
                    {fields && a.platformId ? (
                      <CopyValue label={`${fields.id} for this offer`} value={a.platformId} />
                    ) : null}
                    {fields?.publisherId && a.publisherId ? (
                      <CopyValue label={fields.publisherId} value={a.publisherId} />
                    ) : null}
                    {a.apiInfo ? <CopyValue label="API" value={a.apiInfo} /> : null}
                    {!hasRouting && (
                      <p className="text-sm text-muted sm:col-span-3">
                        Accepted — your routing details are being set up and
                        will show here shortly.
                      </p>
                    )}
                    {a.crmAccessEmail && (
                      <p className="inline-flex items-start gap-2 text-sm leading-relaxed text-muted sm:col-span-3">
                        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold/80" />
                        {a.crmAccess === "Sent" ? (
                          <span>
                            {a.platform || "CRM"} reporting access sent to{" "}
                            <span className="text-foreground">{a.crmAccessEmail}</span> — check
                            your inbox.
                          </span>
                        ) : (
                          <span>
                            {a.platform || "CRM"} reporting access for{" "}
                            <span className="text-foreground">{a.crmAccessEmail}</span> is being
                            set up.
                          </span>
                        )}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-sm leading-relaxed text-muted sm:col-span-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/80">
                          Notes ·{" "}
                        </span>
                        {a.notes}
                      </p>
                    )}
                  </div>
                </div>
              </FadeUp>
              );
            })
          )}
        </section>

        {/* API FORM — self-playing walkthrough of sending a test ping */}
        <section className="mt-16">
          <FadeUp>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Test Your API
            </h2>
            <div className="thread mt-4" />
          </FadeUp>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
            <ApiTesterDemo />
            <div>
              <p className="text-sm leading-relaxed text-muted">
                Before you send live traffic, fire a test ping at your
                buyer&apos;s endpoint to confirm your routing works. It takes
                under a minute:
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  "Click API Form on one of your active offers above.",
                  "Your platform and its ID are already filled in for you.",
                  "Enter a test caller's phone, zip and state.",
                  "Send the ping and check for a 200 OK response.",
                ].map((step, i) => (
                  <li key={step} className="flex gap-4 text-sm text-foreground">
                    <span className="font-display text-base font-semibold text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* APPLICATIONS — pending / rejected */}
        {others.length > 0 && (
          <section className="mt-16">
            <FadeUp>
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Your Applications
              </h2>
              <div className="thread mt-4" />
            </FadeUp>
            {others.map((a) => (
              <div
                key={a.applicationId}
                className="ledger-row flex flex-wrap items-center justify-between gap-3 py-5"
              >
                <div>
                  <p className="font-display text-base font-semibold text-foreground">
                    {a.offerTitle || "Offer"}
                  </p>
                  <p className="text-xs text-muted">Applied {fmtDate(a.appliedAt)}</p>
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.18em]",
                    STATUS_STYLE[a.status]
                  )}
                >
                  {a.status === "Pending" ? "Under review" : a.status}
                </span>
              </div>
            ))}
          </section>
        )}

        <FadeUp className="mt-16">
          <Button asChild size="lg" className="pr-5">
            <Link href="/offers">
              Browse Live Offers <ArrowOrb />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </div>
  );
}
