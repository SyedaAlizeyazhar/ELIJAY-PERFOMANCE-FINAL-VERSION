import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/site/logo";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Buy Calls",
    links: [
      { href: "/for-buyers", label: "Submit a Buyer Offer" },
      { href: "/#products", label: "Inbound Calls" },
      { href: "/#products", label: "Live Transfers" },
      { href: "/#products", label: "Leads" },
    ],
  },
  {
    title: "Sell Calls",
    links: [
      { href: "/apply-as-publisher", label: "Apply as a Publisher" },
      { href: "/publisher-login", label: "Publisher Login" },
      { href: "/offers", label: "Live Offers" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#verticals", label: "Verticals" },
      { href: "/#compliance", label: "Compliance" },
      { href: "/#faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 bg-background">
      <div className="thread" />
      <div className="container grid gap-12 py-20 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <Link href="/" aria-label="ELIJAY Performance Partners — home">
            <Logo variant="stacked" />
          </Link>
          <p className="mt-6 font-serif text-lg italic text-foreground/85">
            Built on partnership, driven by performance.
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            A pay-per-call network buying and selling inbound calls, live
            transfers and leads between vetted publishers and buyers.
          </p>
          {/* Contact details come from lib/site.ts; empty fields are hidden. */}
          {(SITE.email || SITE.phone || SITE.address) && (
            <ul className="mt-6 space-y-2 text-sm">
              {SITE.email && (
                <li className="flex items-center justify-center gap-2.5 md:justify-start">
                  <Mail className="h-4 w-4 shrink-0 text-gold" />
                  <a href={`mailto:${SITE.email}`} className="text-foreground/90 transition-colors hover:text-gold">
                    {SITE.email}
                  </a>
                </li>
              )}
              {SITE.phone && (
                <li className="flex items-center justify-center gap-2.5 md:justify-start">
                  <Phone className="h-4 w-4 shrink-0 text-gold" />
                  <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="text-foreground/90 transition-colors hover:text-gold">
                    {SITE.phone}
                  </a>
                </li>
              )}
              {SITE.address && (
                <li className="flex items-start justify-center gap-2.5 text-muted md:justify-start">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span className="max-w-xs">{SITE.address}</span>
                </li>
              )}
            </ul>
          )}
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
              {col.title}
            </p>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-muted transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="thread" />
      <div className="container py-8">
        <div className="flex flex-col gap-2 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.legalName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms of Service</Link>
            <span className="text-emerald-teal">TCPA-Aligned Network Partner</span>
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
          ELIJAY Performance Partners operates as a call aggregation and routing
          network. All publishers and buyers are independently responsible for
          compliance with applicable federal and state telemarketing, TCPA, and
          licensing regulations within their respective verticals. Payout figures
          shown are representative and subject to change based on live buyer
          demand, geo-targeting, and call quality scoring. This site does not
          constitute a guarantee of call volume, payout, or campaign availability.
        </p>
      </div>
    </footer>
  );
}
