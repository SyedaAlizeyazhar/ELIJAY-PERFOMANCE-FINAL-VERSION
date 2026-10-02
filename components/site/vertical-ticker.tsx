"use client";

/**
 * Continuous ticker of the verticals the network buys in. The list is
 * duplicated once and translated -50%, so the loop is seamless.
 */
const VERTICALS = [
  "Medicare",
  "ACA Health",
  "Final Expense",
  "Auto Insurance",
  "Home Warranty",
  "Solar",
  "Debt Relief",
  "Home Services",
  "U65 Health",
  "MVA Legal",
];

export function VerticalTicker() {
  const row = [...VERTICALS, ...VERTICALS];
  return (
    <div
      className="relative flex overflow-hidden border-y border-gold/15 py-5
                 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
    >
      <div className="flex shrink-0 animate-marquee gap-10 pr-10">
        {row.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="flex shrink-0 items-center gap-3 whitespace-nowrap text-sm uppercase tracking-[0.18em] text-muted"
          >
            <span className="h-1 w-1 rounded-full bg-gold" />
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
