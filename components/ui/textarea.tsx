import * as React from "react";
import { cn } from "@/lib/utils";

/** Boxless luxury textarea, same treatment as Input (.lux-field). */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "lux-field flex min-h-[96px] w-full resize-none rounded-none px-0 py-3 text-base leading-relaxed text-foreground md:text-[15px] caret-gold placeholder:text-muted/45 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
