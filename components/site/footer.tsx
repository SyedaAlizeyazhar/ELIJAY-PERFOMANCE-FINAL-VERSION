import Link from "next/link";
import { Logo } from "@/components/site/logo";

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
          <p>© {new Date().getFullYear()} ELIJAY Performance Partners. All rights reserved.</p>
          <p className="text-emerald-teal">TCPA-Aligned Network Partner</p>
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
