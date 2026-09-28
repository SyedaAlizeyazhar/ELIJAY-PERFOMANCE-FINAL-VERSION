"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { MagneticButton } from "@/components/site/magnetic-button";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

// Pay-per-call sites lead with the two sides of the market: buying calls
// and selling them.
const NAV_LINKS = [
  { href: "/for-buyers", label: "Buy Calls" },
  { href: "/apply-as-publisher", label: "Sell Calls" },
  { href: "/offers", label: "Offers" },
  { href: "/#verticals", label: "Verticals" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Glass header only once the page has moved — flat at the top, frosted after.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gold/15 bg-background/75 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between sm:h-20">
        <Link href="/" aria-label="ELIJAY Performance Partners — home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative py-1 text-sm font-medium transition-colors",
                  active ? "text-gold" : "text-muted hover:text-foreground"
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px w-full origin-left bg-gold-gradient transition-transform duration-500",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-6 lg:flex">
          <Link
            href="/publisher-login"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/publisher-login" ? "text-gold" : "text-foreground hover:text-gold"
            )}
          >
            Publisher Login
          </Link>
          <MagneticButton>
            <Button asChild size="sm" shimmer className="pr-3">
              <Link href="/for-buyers">
                Start Buying <ArrowOrb className="-mr-1.5 h-6 w-6" />
              </Link>
            </Button>
          </MagneticButton>
        </div>

        <button
          className="flex h-11 w-11 items-center justify-end text-foreground lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        // Scrolls on its own when the phone is short (landscape), so the
        // last links are always reachable under the sticky header.
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-t border-gold/15 bg-background/95 px-6 pb-8 backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col pt-2">
            {[...NAV_LINKS, { href: "/publisher-login", label: "Publisher Login" }].map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-baseline gap-4 border-b border-gold/10 py-4 font-serif text-2xl transition-colors",
                  pathname === link.href ? "text-gold" : "text-foreground"
                )}
              >
                <span className="font-sans text-xs text-gold/60">{String(i + 1).padStart(2, "0")}</span>
                {link.label}
              </Link>
            ))}
            <Button asChild size="lg" className="mt-6 w-full" onClick={() => setOpen(false)}>
              <Link href="/for-buyers">Start Buying Calls</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
