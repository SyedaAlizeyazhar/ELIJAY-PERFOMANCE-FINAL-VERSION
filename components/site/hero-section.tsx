"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Gauge, ShieldCheck, Radio, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Typewriter } from "@/components/site/typewriter";
import { UsaRoutingMap } from "@/components/site/usa-routing-map";

const STATS = [
  { icon: ShieldCheck, value: "100%", label: "TCPA Compliant Routing" },
  { icon: Gauge, value: "<1.8s", label: "Average Connect Time" },
  { icon: Radio, value: "24/7", label: "Real-Time Call Distribution" },
  { icon: Wallet, value: "Stated", label: "Payment Terms on Every Offer" },
];

// The two sides of the market, as the hero's primary actions.
const PATHS = [
  {
    href: "/for-buyers",
    kicker: "For buyers",
    title: "I'm buying calls",
    body: "Inbound calls, live transfers and leads for your agents.",
  },
  {
    href: "/apply-as-publisher",
    kicker: "For publishers",
    title: "I'm selling calls",
    body: "Monetize your traffic across live, vetted offers.",
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection() {
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* depth stack: grid < orbs < content */}
      <div className="grid-fade layer-bg absolute inset-0" />
      <div
        aria-hidden="true"
        className="layer-blob pointer-events-none absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full bg-[#D6A343] opacity-20 blur-[100px] md:h-[460px] md:w-[460px] md:animate-drift"
      />
      <div
        aria-hidden="true"
        className="layer-blob pointer-events-none absolute bottom-40 -left-28 h-[360px] w-[360px] rounded-full bg-[#003B32] opacity-80 blur-[100px] [animation-delay:-9s] md:h-[480px] md:w-[480px] md:animate-drift"
      />

      <div className="container relative z-10 pb-16 pt-14 md:pb-24 md:pt-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
          <Badge variant="accent" className="mb-7">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            Pay-Per-Call · Live Transfers · Leads
          </Badge>
        </motion.div>

        {/* Badge sits above the grid, so the heading and the map both start
            on the grid's first line whatever the font sizes are. */}
        <div className="grid gap-14 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.08, ease }}
              className="font-display text-[2.1rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.5rem]"
            >
              Calls that convert,{" "}
              <span className="font-serif text-[1.12em] font-medium italic tracking-normal text-gold-gradient">
                precision matched.
              </span>
            </motion.h1>

            <p className="mt-5 font-display text-sm tracking-wide text-gold md:text-base">
              <Typewriter text="Built on partnership, driven by performance." />
            </p>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted md:text-base">
              ELIJAY buys and sells qualified inbound calls, live transfers and
              leads — screened for consent, duplicates, geo and duration, then
              routed to the right buyer in real time.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
            className="hidden lg:block lg:self-start"
          >
            <UsaRoutingMap className="ml-auto w-full max-w-[430px]" />
          </motion.div>
        </div>

        {/* Two doors: buy or sell — centred under the hero */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-x-12 gap-y-2 sm:grid-cols-2 md:mt-28">
          {PATHS.map((p, i) => (
            <motion.div
              key={p.href}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease }}
            >
              <Link
                href={p.href}
                className="ledger-row group flex h-full items-center justify-between gap-5 border-t border-gold/15 py-5"
              >
                <span className="min-w-0">
                  <span className="block text-[10.5px] font-semibold uppercase tracking-[0.24em] text-emerald-teal">
                    {p.kicker}
                  </span>
                  <span className="mt-1.5 block font-serif text-2xl leading-tight text-foreground transition-colors group-hover:text-gold">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{p.body}</span>
                </span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 transition-colors duration-500 group-hover:border-gold group-hover:bg-gold">
                  <ArrowUpRight className="h-5 w-5 text-gold transition-all duration-500 group-hover:rotate-45 group-hover:text-ink" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stat rail: each figure hangs from its own gold thread, with the
            icon inside a ring that draws itself in. */}
        <div className="mt-20 grid grid-cols-2 gap-y-10 md:mt-32 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.12, ease }}
              className="group relative pl-5 pr-3"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-gold/45 to-transparent transition-colors duration-500 group-hover:via-gold"
              />
              <span className="relative mb-4 flex h-11 w-11 items-center justify-center">
                <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(214,163,67,0.15)" strokeWidth="1" />
                  <circle
                    cx="22"
                    cy="22"
                    r="20"
                    fill="none"
                    stroke="#D6A343"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="ring-draw"
                    style={{ animationDelay: `${0.6 + i * 0.15}s` }}
                  />
                </svg>
                <stat.icon className="h-4 w-4 text-gold transition-transform duration-500 group-hover:scale-110" />
              </span>
              <p className="font-display text-2xl font-semibold text-foreground transition-transform duration-500 group-hover:translate-x-1 md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
