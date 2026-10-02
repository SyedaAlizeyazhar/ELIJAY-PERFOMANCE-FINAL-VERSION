import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/site/motion-wrap";
import { PageIntro } from "@/components/site/page-intro";
import { PublisherForm } from "@/components/forms/publisher-form";

export const metadata: Metadata = {
  title: "Sell Calls",
  description:
    "Apply as a publisher to monetize your call traffic across live, vetted pay-per-call offers with payment terms stated up front.",
  alternates: { canonical: "/apply-as-publisher" },
};

export default function ApplyAsPublisherPage() {
  return (
    <div className="bg-hero-gradient">
      <div className="container grid gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.25fr]">
        <FadeUp>
          <PageIntro
            kicker="Sell Calls"
            title="Your traffic,"
            accent="treated like an asset."
            body="Join a network built for serious publishers. Apply once, pass vetting, and get access to live offers with everything you need to start sending calls."
            points={[
              "Live offers across high-demand verticals",
              "Payment terms stated on every offer",
              "Your own dashboard with DID, RTB ID and API",
              "Transparent rejection reasons",
              "A dedicated account manager who knows your traffic",
            ]}
          >
            <div className="mt-10 max-w-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-teal">
                How approval works
              </p>
              <ol className="mt-4 space-y-3 text-sm text-muted">
                <li><span className="mr-3 font-serif text-lg italic text-gold">i.</span>Apply with your company, traffic and two references</li>
                <li><span className="mr-3 font-serif text-lg italic text-gold">ii.</span>Our team reviews and vets your sources</li>
                <li><span className="mr-3 font-serif text-lg italic text-gold">iii.</span>Approved? You receive your login to the live offers</li>
              </ol>
            </div>
          </PageIntro>
        </FadeUp>

        <FadeUp>
          <Card>
            <CardContent className="p-6 md:p-10">
              <PublisherForm />
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
