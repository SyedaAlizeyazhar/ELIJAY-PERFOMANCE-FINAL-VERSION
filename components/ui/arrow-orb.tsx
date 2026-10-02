import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The round arrow that sits at the end of a pill CTA. On hover it slides
 * forward and tilts up, so the button reads as "go" without a box around it.
 * Place inside a <Button> (which carries the `group` class).
 */
export function ArrowOrb({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "-mr-4 ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/90 text-gold transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-45",
        className
      )}
    >
      <ArrowRight className="h-4 w-4" />
    </span>
  );
}
