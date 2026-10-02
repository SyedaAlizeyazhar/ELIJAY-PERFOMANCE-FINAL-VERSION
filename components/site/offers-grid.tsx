"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { OfferRow } from "@/components/site/offer-row";
import { cn } from "@/lib/utils";
import type { Offer, Vertical } from "@/lib/types";

export function OffersGrid({
  offers,
  verticals,
}: {
  offers: Offer[];
  verticals: Vertical[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(
    () => (active ? offers.filter((o) => o.vertical === active) : offers),
    [offers, active]
  );

  // Filter tabs reflect only what currently exists in the Verticals KV list.
  // An offer that still references a deleted vertical stays visible under
  // "All Verticals," but its vertical no longer gets its own filter.
  const verticalNames = useMemo(
    () => verticals.map((v) => v.name),
    [verticals]
  );

  // If the currently selected filter's vertical gets deleted (e.g. an admin
  // removes it while this page is open), fall back to "All Verticals"
  // instead of silently filtering by a vertical that no longer exists.
  useEffect(() => {
    if (active && !verticalNames.includes(active)) {
      setActive(null);
    }
  }, [active, verticalNames]);

  const tabs: Array<{ key: string | null; label: string }> = [
    { key: null, label: "All Verticals" },
    ...verticalNames.map((name) => ({ key: name, label: name })),
  ];

  return (
    <div>
      {/* Filter: text tabs with a gold thread under the active one */}
      <div className="flex flex-wrap gap-x-7 gap-y-3">
        {tabs.map((tab) => {
          const on = active === tab.key;
          return (
            <button
              key={tab.label}
              onClick={() => setActive(tab.key)}
              className={cn(
                "relative pb-2 text-sm font-medium transition-colors",
                on ? "text-gold" : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {on && (
                <motion.span
                  layoutId="offer-tab-thread"
                  className="absolute inset-x-0 -bottom-px h-px bg-gold-gradient"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="thread mt-6" />

      {filtered.length === 0 ? (
        <p className="py-14 text-center text-muted">
          No live offers in this vertical right now — check back soon.
        </p>
      ) : (
        <motion.div
          key={active ?? "all"}
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
        >
          {filtered.map((offer, i) => (
            <motion.div
              key={offer.id}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <OfferRow offer={offer} index={i} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
