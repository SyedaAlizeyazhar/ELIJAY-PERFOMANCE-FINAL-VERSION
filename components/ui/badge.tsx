import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
  {
    variants: {
      variant: {
        default: "border border-border bg-foreground/5 text-foreground",
        accent: "border border-emerald-teal/35 bg-emerald-teal/10 text-emerald-teal",
        live: "border border-emerald-teal/35 bg-emerald/60 text-emerald-teal",
        gold: "border border-gold/35 bg-gold/10 text-gold",
        paused: "border border-border bg-muted/10 text-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
