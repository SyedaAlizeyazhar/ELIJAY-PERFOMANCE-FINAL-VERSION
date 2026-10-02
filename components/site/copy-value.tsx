"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** A labelled value (DID, RTB ID, API) with a one-tap copy button. */
export function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the value is still selectable */
    }
  }

  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</p>
      <div className="mt-1 flex items-start gap-2">
        <p className="min-w-0 break-all font-mono text-sm text-foreground">{value}</p>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="mt-0.5 shrink-0 text-gold/70 transition-colors hover:text-gold"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}
