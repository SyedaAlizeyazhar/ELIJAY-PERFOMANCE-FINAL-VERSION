"use client";

/**
 * Live call waveform — a row of bars that breathe like speech on an active
 * line. Purely decorative signal that calls are flowing, not a real meter.
 *
 * CSS-only: each bar has its own duration and delay, so the pattern never
 * visibly loops. No JS, no timers, no bundle cost.
 */
export function Waveform({ bars = 28 }: { bars?: number }) {
  return (
    <div className="flex h-8 items-center gap-[3px]" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-emerald-teal to-gold"
          style={{
            height: `${20 + ((i * 37) % 70)}%`,
            animation: `wave ${900 + ((i * 131) % 700)}ms ease-in-out ${
              (i * 70) % 900
            }ms infinite alternate`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          from {
            transform: scaleY(0.35);
            opacity: 0.45;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
