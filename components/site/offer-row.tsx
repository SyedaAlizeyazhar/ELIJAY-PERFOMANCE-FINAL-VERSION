import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GeoChips } from "@/components/site/geo-chips";
import type { Offer } from "@/lib/types";

/**
 * One offer as a ledger row instead of a card: vertical and title on the
 * left, geo in the middle, payout on the right, joined by a hairline that a
 * gold thread sweeps across on hover. The whole row is the link.
 */
export function OfferRow({ offer, index }: { offer: Offer; index?: number }) {
  return (
    <Link
      href={`/offers/${offer.id}`}
      className="ledger-row group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 py-6 transition-colors md:grid-cols-[3rem_1.4fr_1fr_auto_2rem] md:py-7"
    >
      {index !== undefined && (
        <span className="hidden font-display text-sm text-gold/50 md:block">
          {String(index + 1).padStart(2, "0")}
        </span>
      )}

      <div className="min-w-0 transition-transform duration-500 group-hover:translate-x-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-teal">
          {offer.vertical}
          <span className="ml-2 inline-flex items-center gap-1 text-emerald-teal/80">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-emerald-teal" />
            Live
          </span>
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold text-foreground md:text-xl">
          {offer.title}
        </h3>
        {offer.description && (
          <p className="mt-1 line-clamp-1 text-sm text-muted">{offer.description}</p>
        )}
      </div>

      <div className="col-span-2 row-start-2 md:col-span-1 md:row-start-auto">
        <GeoChips geo={offer.geo} limit={6} />
      </div>

      <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Payout</p>
        <p className="font-display text-xl font-semibold text-gold md:text-2xl">{offer.payout}</p>
      </div>

      <ArrowUpRight className="hidden h-5 w-5 text-gold/60 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold md:block" />
    </Link>
  );
}
