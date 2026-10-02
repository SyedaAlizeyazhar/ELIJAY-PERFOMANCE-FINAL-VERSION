import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/lib/site";

/** Shared shell for the Privacy Policy and Terms: intro, then numbered sections. */
export function LegalPage({
  kicker,
  title,
  accent,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  accent: string;
  intro: ReactNode;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <div className="bg-hero-gradient">
      <div className="container max-w-3xl py-16 md:py-24">
        <Badge variant="gold" className="mb-6">{kicker}</Badge>
        <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-[-0.01em] text-foreground md:text-[2.75rem]">
          {title}{" "}
          <span className="font-serif text-[1.1em] font-medium italic text-gold-gradient">{accent}</span>
        </h1>
        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">Last updated {SITE.legalUpdated}</p>
        <div className="mt-8 text-[15px] leading-relaxed text-muted">{intro}</div>

        <ol className="mt-12">
          <li aria-hidden="true" className="thread" />
          {sections.map((s, i) => (
            <li key={s.heading} className="border-b border-gold/10 py-8">
              <h2 className="flex items-baseline gap-4 font-display text-lg font-semibold text-foreground">
                <span className="w-6 shrink-0 text-xs font-semibold tabular-nums tracking-wider text-gold/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.heading}
              </h2>
              <div className="mt-3 space-y-3 pl-10 text-[15px] leading-relaxed text-muted">{s.body}</div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** "email us at x" when an email is configured, otherwise the contact form. */
export function ContactLine() {
  return SITE.email ? (
    <>
      email us at{" "}
      <a href={`mailto:${SITE.email}`} className="text-gold hover:underline">
        {SITE.email}
      </a>
    </>
  ) : (
    <>
      reach us through our{" "}
      <Link href="/contact" className="text-gold hover:underline">
        contact page
      </Link>
    </>
  );
}
