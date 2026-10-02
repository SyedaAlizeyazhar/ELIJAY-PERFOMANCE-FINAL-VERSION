import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One chapter of a long form: a serif roman numeral, a small-caps title and a
 * gold thread running out to the edge, then the fields underneath. Replaces
 * boxed field groups with an editorial, luxury rhythm.
 */
export function FormChapter({
  numeral,
  title,
  description,
  children,
  className,
}: {
  numeral: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const id = `chapter-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className={cn("space-y-7", className)}>
      <div>
        <div className="flex items-center gap-4">
          <span className="font-serif text-4xl font-medium italic leading-none text-gold">
            {numeral}
          </span>
          <h3
            id={id}
            className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-foreground"
          >
            {title}
          </h3>
          <span aria-hidden="true" className="thread flex-1" />
        </div>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** Two-up field row that stacks on phones. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">{children}</div>;
}
