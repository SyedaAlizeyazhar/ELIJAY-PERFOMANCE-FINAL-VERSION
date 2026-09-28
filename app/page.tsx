import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Clock,
  MapPin,
  PhoneIncoming,
  PhoneForwarded,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Badge } from "@/components/ui/badge";
import { FadeUp, StaggerGroup, StaggerItem } from "@/components/site/motion-wrap";
import { HeroSection } from "@/components/site/hero-section";
import { MagneticButton } from "@/components/site/magnetic-button";
import { CallExchange } from "@/components/site/call-exchange";
import { Waveform } from "@/components/site/waveform";
import { Counter } from "@/components/site/counter";
import { VerticalTicker } from "@/components/site/vertical-ticker";
import { OffersLocked } from "@/components/site/offers-locked";
import { OfferRow } from "@/components/site/offer-row";
import { getActiveOffers } from "@/lib/kv";
import { getPublisherSession } from "@/lib/publisher-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PRODUCTS = [
  {
    icon: PhoneIncoming,
    title: "Inbound Calls",
    body: "Consumers dial in from publisher campaigns and ring straight through to your agents — high intent, exclusive, in real time.",
    specs: ["Exclusive per caller", "Billable after your buffer", "State & ZIP targeting"],
  },
  {
    icon: PhoneForwarded,
    title: "Live Transfers",
    body: "A screener qualifies the caller first, then warm-transfers them to your floor — ready to talk, questions answered.",
    specs: ["Pre-qualified on your script", "Warm hand-off", "Recorded end to end"],
  },
  {
    icon: FileSpreadsheet,
    title: "Leads",
    body: "Consented, verified prospect data delivered to your CRM or dialer for outbound follow-up.",
    specs: ["Consent trail on file", "Duplicate-scrubbed", "Delivered by API or file"],
  },
];

const BUYER_POINTS = [
  "Target by vertical, state, ZIP and hours",
  "Set buffers, daily caps and concurrency",
  "Receive by DID, RTB, ping-post or IVR",
  "Every call recorded and quality-scored",
  "A direct line to our team, not a queue",
];

const PUBLISHER_POINTS = [
  "Live offers across high-demand verticals",
  "Payment terms stated on every offer",
  "Your own dashboard with DID, RTB ID and API",
  "Transparent rejection reasons",
  "A dedicated account manager",
];

const QUALIFIED = [
  { icon: Clock, title: "Duration", body: "Meets the campaign's billable buffer before it counts." },
  { icon: MapPin, title: "Geo match", body: "Caller location matches the states and ZIPs you buy." },
  { icon: UserCheck, title: "Real intent", body: "A live person with a genuine need — no bots or incentives." },
  { icon: ShieldCheck, title: "Clean & consented", body: "Consent on file, not a duplicate, inside your hours and caps." },
];

const DELIVERY = [
  { code: "DID", body: "A dedicated tracking number per campaign — the simplest way to receive calls." },
  { code: "RTB", body: "Real-time bidding: bid per call and win the callers you value most." },
  { code: "PING / POST", body: "Caller data is pinged first; you accept before the call connects." },
  { code: "IVR · API", body: "Pre-screen with IVR menus or integrate straight into your stack." },
];

const VERTICALS = [
  "Medicare",
  "Final Expense",
  "ACA Health",
  "U65 Health",
  "Auto Insurance",
  "Home Warranty",
  "Home Services",
  "Solar",
  "Debt Relief",
  "MVA Legal",
];

const COMPLIANCE = [
  { t: "One-to-one consent", d: "Consent trail, source URL, script and opt-in language reviewed before approval." },
  { t: "DNC scrubbing", d: "Numbers checked against Do-Not-Call lists where the campaign requires it." },
  { t: "Recorded & scored", d: "Calls are recorded and quality-scored on every campaign." },
  { t: "Duplicate screening", d: "Repeat callers filtered before they ever reach a buyer." },
  { t: "Geo & hour enforcement", d: "Caps, states and calling windows enforced at the router." },
  { t: "Vetted publishers", d: "Every publisher supplies two pay-per-call references before approval." },
];

const FAQ = [
  {
    q: "What's the difference between an inbound call and a live transfer?",
    a: "An inbound call rings straight from the consumer to your agent. A live transfer is screened first — a qualifier speaks to the caller, confirms they fit your criteria, then warm-transfers them to your floor.",
  },
  {
    q: "When is a call billable?",
    a: "Each campaign sets its own rules: a minimum duration (buffer), the states or ZIPs it buys, hours and caps. Calls that miss them — duplicates, short calls, out-of-geo — are not billed.",
  },
  {
    q: "How do I start buying calls?",
    a: "Submit your offer on the Buy Calls page with your payout, vertical, targeting and cap. Our team reviews it, confirms delivery (DID, RTB, ping-post or IVR) and makes it live to vetted publishers.",
  },
  {
    q: "How do publishers get access to offers?",
    a: "Apply as a publisher with your company details, traffic sources and two pay-per-call references. Once approved you receive a login to the live offers and your own dashboard.",
  },
  {
    q: "When do publishers get paid?",
    a: "Payment terms are stated on every offer before you send a single call, so you always know what you're working to.",
  },
  {
    q: "Which verticals do you work in?",
    a: "Medicare, Final Expense, ACA and U65 Health, Auto Insurance, Home Warranty, Home Services, Solar, Debt Relief and MVA Legal — with more added as buyer demand shifts.",
  },
];

function SectionHead({
  kicker,
  title,
  accent,
  body,
  center,
}: {
  kicker: string;
  title: string;
  accent?: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <FadeUp className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Badge className={center ? "mx-auto mb-5" : "mb-5"}>{kicker}</Badge>
      <h2 className="font-display text-[1.7rem] font-semibold leading-[1.1] tracking-[-0.01em] text-foreground md:text-[2.4rem]">
        {title}{" "}
        {accent && (
          <span className="font-serif text-[1.1em] font-medium italic text-gold-gradient">{accent}</span>
        )}
      </h2>
      {body && <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">{body}</p>}
    </FadeUp>
  );
}

export default async function HomePage() {
  // Offer details are for approved publishers only; everyone else sees the
  // locked panel with Apply / Login instead of the preview.
  const publisher = await getPublisherSession();
  let offers: Awaited<ReturnType<typeof getActiveOffers>> = [];
  if (publisher) {
    try {
      offers = (await getActiveOffers()).slice(0, 4);
    } catch {
      offers = [];
    }
  }

  return (
    <div>
      <HeroSection />
      <VerticalTicker />

      {/* WHAT WE DELIVER */}
      <section id="products" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container">
          <SectionHead
            kicker="What We Deliver"
            title="Three ways to buy"
            accent="high-intent customers."
            body="Whether your floor wants callers ringing in, pre-qualified transfers or consented data to dial, the same screening sits behind every one."
          />
          <StaggerGroup className="mt-16 grid gap-y-14 md:grid-cols-3">
            {PRODUCTS.map((p, i) => (
              <StaggerItem key={p.title}>
                <div
                  className={
                    i === 0
                      ? "group relative h-full md:pr-10"
                      : i === PRODUCTS.length - 1
                        ? "group relative h-full md:pl-10"
                        : "group relative h-full md:px-10"
                  }
                >
                  {i > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-gold/35 to-transparent md:block"
                    />
                  )}
                  <div className="flex items-end justify-between">
                    <span className="numeral-outline font-display text-5xl font-semibold leading-none">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p.icon className="mb-2 h-6 w-6 text-gold transition-transform duration-500 group-hover:-translate-y-1" />
                  </div>
                  <div className="thread mt-6 opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                  <h3 className="mt-5 font-serif text-2xl text-foreground">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.body}</p>
                  <ul className="mt-5 space-y-2">
                    {p.specs.map((s) => (
                      <li key={s} className="flex items-center gap-2.5 text-sm text-foreground/85">
                        <span className="h-1 w-1 rounded-full bg-gold" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* HOW A CALL MOVES */}
      <section className="relative py-20 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[130vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-blob opacity-20 blur-[120px]"
        />
        <div className="container relative">
          <SectionHead
            kicker="How It Works"
            title="Calls bought, calls sold —"
            accent="nothing wasted."
            body="Publishers sell inbound calls on one side, buyers purchase them on the other, and ELIJAY screens and matches in between. Calls that fail consent, duplicate, geo or duration checks never reach a buyer."
          />
          <FadeUp className="mt-10">
            <CallExchange className="block h-[540px] w-full sm:h-[420px] md:h-[480px]" />
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-gold" />
                Call in flight
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-teal" />
                Screening ring
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                Disqualified at screening
              </span>
            </div>
          </FadeUp>

          <FadeUp className="mt-14">
            <div className="thread" />
            <div className="flex flex-col items-start justify-between gap-5 py-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <Waveform />
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">Live line, in progress</p>
                  <p className="text-xs text-muted">Calls are recorded and scored for quality on every campaign.</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-teal">
                <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
                Routing Active
              </span>
            </div>
            <div className="thread" />
          </FadeUp>
        </div>
      </section>

      {/* BUY / SELL — the two sides of the market */}
      <section className="relative py-20 md:py-28">
        <div className="container">
          <SectionHead center kicker="Two Sides, One Network" title="Built for both ends" accent="of the call." />
          <div className="relative mt-16 grid gap-16 md:grid-cols-2 md:gap-0">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-transparent via-gold/45 to-transparent md:block"
            />
            {[
              {
                kicker: "For Buyers",
                title: "Buy calls",
                body: "Tell us your payout and targeting. We publish your campaign to vetted publishers and route only clean, qualified calls.",
                points: BUYER_POINTS,
                href: "/for-buyers",
                cta: "Submit a Buyer Offer",
              },
              {
                kicker: "For Publishers",
                title: "Sell calls",
                body: "Bring compliant traffic, pass vetting, and get access to live offers with the routing details you need to go live.",
                points: PUBLISHER_POINTS,
                href: "/apply-as-publisher",
                cta: "Apply as a Publisher",
              },
            ].map((side, i) => (
              <FadeUp key={side.title} className={i === 0 ? "md:pr-14" : "md:pl-14"}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-teal">{side.kicker}</p>
                <h3 className="mt-3 font-serif text-4xl text-foreground md:text-[2.6rem]">{side.title}</h3>
                <p className="mt-4 leading-relaxed text-muted">{side.body}</p>
                <ul className="mt-8">
                  {side.points.map((pt) => (
                    <li key={pt} className="ledger-row flex items-center gap-4 py-4 text-sm text-foreground/90">
                      <Check className="h-4 w-4 shrink-0 text-gold" />
                      {pt}
                    </li>
                  ))}
                </ul>
                <Button asChild size="lg" className="mt-9 pr-5" variant={i === 0 ? "default" : "outline"}>
                  <Link href={side.href}>
                    {side.cta} <ArrowOrb className={i === 0 ? undefined : "bg-gold text-ink"} />
                  </Link>
                </Button>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT MAKES A QUALIFIED CALL */}
      <section className="relative py-20 md:py-28">
        <div className="container">
          <SectionHead
            kicker="The Qualified Call Standard"
            title="You only pay for calls"
            accent="that count."
          />
          <StaggerGroup className="mt-14 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {QUALIFIED.map((q) => (
              <StaggerItem key={q.title}>
                <div className="group relative h-full pl-5 pr-4">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent transition-colors duration-500 group-hover:from-gold"
                  />
                  <q.icon className="h-6 w-6 text-gold" />
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{q.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{q.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* DELIVERY / ROUTING */}
      <section className="relative py-20 md:py-28">
        <div className="container grid gap-14 lg:grid-cols-[1fr_1.25fr] lg:items-start">
          <SectionHead
            kicker="Delivery & Routing"
            title="Plugs into how"
            accent="you already buy."
            body="Every campaign is set up around your stack — whichever way your call center takes calls, we route to it."
          />
          <FadeUp>
            <div className="thread" />
            {DELIVERY.map((d) => (
              <div key={d.code} className="ledger-row group grid items-baseline gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                <span className="font-mono text-base tracking-wider text-gold transition-transform duration-500 group-hover:translate-x-1.5">
                  {d.code}
                </span>
                <span className="text-sm leading-relaxed text-muted">{d.body}</span>
              </div>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* VERTICALS */}
      <section id="verticals" className="relative scroll-mt-24 py-20 md:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-8%] top-1/4 h-[240px] w-[110vw] max-w-[420px] rounded-full bg-emerald-blob opacity-20 blur-[120px]"
        />
        <div className="container relative">
          <SectionHead kicker="Verticals" title="Where the calls" accent="are buying." />
          <FadeUp className="mt-14 grid sm:grid-cols-2">
            {VERTICALS.map((v, i) => (
              <div
                key={v}
                className="ledger-row group flex items-baseline gap-5 py-5 sm:odd:pr-10 sm:even:pl-10"
              >
                <span className="font-mono text-xs text-gold/60">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-serif text-2xl text-foreground transition-all duration-500 group-hover:translate-x-2 group-hover:text-gold md:text-[1.7rem]">
                  {v}
                </span>
              </div>
            ))}
          </FadeUp>
          <p className="mt-6 text-sm text-muted">
            Buying in another vertical?{" "}
            <Link href="/for-buyers" className="text-gold underline-offset-4 hover:underline">
              Tell us about it
            </Link>
            .
          </p>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="relative py-20 md:py-28">
        <div className="container relative">
          <SectionHead center kicker="By the Numbers" title="Built for volume," accent="tuned for quality." />
          <StaggerGroup className="mt-14 grid grid-cols-2 gap-y-10 md:grid-cols-4">
            {[
              { value: 120, suffix: "s+", label: "Avg. billable duration" },
              { value: 94, suffix: "%", label: "Buyer acceptance rate" },
              { value: 40, suffix: "+", label: "Active buyer partners" },
              { value: 12, suffix: "", label: "Verticals in rotation" },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="relative text-center">
                  <p className="font-display text-4xl font-semibold text-gold-gradient md:text-5xl">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <div className="thread mx-auto mt-3 w-16" />
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <p className="mt-10 text-center text-[11px] leading-relaxed text-muted/60">
            Figures are representative of recent network performance and vary by vertical, geo and time of day.
            They are not a guarantee of results.
          </p>
        </div>
      </section>

      {/* LIVE OFFERS PREVIEW */}
      <section className="relative py-20 md:py-28">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead
              kicker="Live Offers"
              title="What's buying"
              accent="right now."
              body="Payouts and geo-targeting update as buyer demand shifts. Full details are private to approved publishers."
            />
            <Button asChild variant="thread">
              <Link href="/offers">View All Offers</Link>
            </Button>
          </div>

          {!publisher ? (
            <FadeUp className="mt-12">
              <OffersLocked />
            </FadeUp>
          ) : offers.length > 0 ? (
            <FadeUp className="mt-10">
              <div className="thread" />
              {offers.map((offer, i) => (
                <OfferRow key={offer.id} offer={offer} index={i} />
              ))}
            </FadeUp>
          ) : (
            <FadeUp className="mt-12">
              <div className="thread" />
              <p className="py-10 text-center text-muted">
                New live offers are added regularly — check back soon or{" "}
                <Link href="/offers" className="text-gold underline">
                  browse all verticals
                </Link>
                .
              </p>
              <div className="thread" />
            </FadeUp>
          )}
        </div>
      </section>

      {/* COMPLIANCE */}
      <section id="compliance" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <SectionHead
            kicker="Compliance First"
            title="Clean traffic is"
            accent="the whole business."
            body="Every publisher is vetted before a single call routes. Consent trails, source URLs, recordings and scripts are reviewed up front — and audited again as volume scales."
          />
          <StaggerGroup className="grid sm:grid-cols-2 sm:gap-x-10">
            {COMPLIANCE.map((item) => (
              <StaggerItem key={item.t}>
                <div className="ledger-row group flex gap-4 py-5">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 transition-colors duration-500 group-hover:bg-gold">
                    <Check className="h-3.5 w-3.5 text-gold transition-colors duration-500 group-hover:text-ink" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">{item.t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.d}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative scroll-mt-24 py-20 md:py-28">
        <div className="container grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <SectionHead kicker="FAQ" title="Questions," accent="answered." />
          <FadeUp>
            <div className="thread" />
            {FAQ.map((f) => (
              <details key={f.q} className="faq ledger-row group py-6">
                <summary className="flex items-start justify-between gap-6">
                  <span className="font-serif text-lg text-foreground transition-colors group-hover:text-gold md:text-xl">
                    {f.q}
                  </span>
                  <Plus className="faq-plus mt-1 h-5 w-5 shrink-0 text-gold/70 transition-transform duration-300" />
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </FadeUp>
        </div>
      </section>

      {/* FINAL CTA — both doors */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[130vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-blob opacity-30 blur-[110px]"
        />
        <div className="container relative text-center">
          <div className="thread mx-auto max-w-3xl" />
          <div className="py-14 md:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Ready When You Are</p>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.08] text-foreground md:text-5xl">
              Buying or selling calls?{" "}
              <span className="font-serif font-medium italic text-gold-gradient">Let&apos;s talk.</span>
            </h2>
            <div className="mt-10 flex flex-col items-center justify-center gap-x-10 gap-y-5 sm:flex-row">
              <MagneticButton>
                <Button asChild size="lg" shimmer className="pr-5">
                  <Link href="/for-buyers">
                    Start Buying Calls <ArrowOrb />
                  </Link>
                </Button>
              </MagneticButton>
              <Button asChild size="lg" variant="thread">
                <Link href="/apply-as-publisher">
                  Start Selling Calls <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="thread mx-auto max-w-3xl" />
        </div>
      </section>
    </div>
  );
}
