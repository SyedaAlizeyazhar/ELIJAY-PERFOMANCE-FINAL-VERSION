import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FadeUp } from "@/components/site/motion-wrap";
import { PageIntro } from "@/components/site/page-intro";
import { ContactForm } from "@/components/forms/contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about buying or selling calls on the ELIJAY network? Reach out and our team will follow up shortly.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-hero-gradient">
      <div className="container grid gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.1fr]">
        <FadeUp>
          <PageIntro
            kicker="Get in Touch"
            title="Let's talk"
            accent="calls."
            body="Questions about buying, selling or the network in general — reach out and our team will follow up shortly."
          >
            <div className="mt-10 max-w-lg">
              <div className="thread" />
              <Link href="/for-buyers" className="ledger-row group flex items-baseline justify-between py-5">
                <span className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">Buying calls?</span>
                <span className="text-sm text-gold">Submit an offer →</span>
              </Link>
              <Link href="/apply-as-publisher" className="ledger-row group flex items-baseline justify-between py-5">
                <span className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">Selling calls?</span>
                <span className="text-sm text-gold">Apply as a publisher →</span>
              </Link>
              {/* Contact details come from lib/site.ts; empty fields are hidden. */}
              {SITE.email && (
                <a href={`mailto:${SITE.email}`} className="ledger-row group flex items-baseline justify-between gap-4 py-5">
                  <span className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">Email</span>
                  <span className="truncate text-sm text-gold">{SITE.email}</span>
                </a>
              )}
              {SITE.phone && (
                <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="ledger-row group flex items-baseline justify-between gap-4 py-5">
                  <span className="font-serif text-2xl text-foreground transition-colors group-hover:text-gold">Call</span>
                  <span className="text-sm text-gold">{SITE.phone}</span>
                </a>
              )}
              {SITE.address && (
                <div className="ledger-row flex items-baseline justify-between gap-4 py-5">
                  <span className="font-serif text-2xl text-foreground">Office</span>
                  <span className="max-w-[60%] text-right text-sm text-muted">{SITE.address}</span>
                </div>
              )}
            </div>
          </PageIntro>
        </FadeUp>

        <FadeUp>
          <Card>
            <CardContent className="p-6 md:p-10">
              <ContactForm />
            </CardContent>
          </Card>
        </FadeUp>
      </div>
    </div>
  );
}
