import * as React from "react";
import { cn } from "@/lib/utils";

/** Boxless luxury input: hairline underneath, gold line opens on focus (.lux-field). */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "lux-field flex h-12 w-full rounded-none px-0 text-base text-foreground md:text-[15px] caret-gold placeholder:text-muted/45 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
