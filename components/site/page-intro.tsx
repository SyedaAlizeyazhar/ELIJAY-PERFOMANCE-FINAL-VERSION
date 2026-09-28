import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * The left-hand intro used on the form pages (Buy Calls, Sell Calls,
 * Contact): kicker, display title with a serif-italic gold accent, body copy
 * and an optional checklist on threads. Sticks beside the form on desktop.
 */
export function PageIntro({
  kicker,
  title,
  accent,
  body,
  points,
  children,
  className,
}: {
  kicker: string;
  title: string;
  accent?: string;
  body?: ReactNode;
  points?: string[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("lg:sticky lg:top-28", className)}>
      <Badge variant="gold" className="mb-6">{kicker}</Badge>
      <h1 className="font-display text-3xl font-semibold leading-[1.08] tracking-[-0.01em] text-foreground md:text-[2.75rem]">
        {title}{" "}
        {accent && (
          <span className="font-serif text-[1.1em] font-medium italic text-gold-gradient">{accent}</span>
        )}
      </h1>
      {body && <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted md:text-base">{body}</p>}
      {points && points.length > 0 && (
        <ul className="mt-10 max-w-lg">
          <li aria-hidden="true" className="thread" />
          {points.map((p) => (
            <li key={p} className="ledger-row flex items-center gap-4 py-4 text-sm text-foreground/90">
              <Check className="h-4 w-4 shrink-0 text-gold" />
              {p}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}
