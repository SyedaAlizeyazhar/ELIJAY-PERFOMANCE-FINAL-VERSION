"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESETS = ["Warm Transfer", "Blind Transfer", "Inbounds"] as const;

/**
 * Allowed traffic stays a single comma-separated string in KV, so the Offer
 * type and every read path are unchanged. This picker just makes the common
 * three one-tap, while still allowing free-text for anything unusual
 * ("No incentivised", "SEO only", etc).
 */
export function TrafficPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const parsed = useMemo(() => {
    const parts = (value ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const selected = PRESETS.filter((preset) =>
      parts.some((p) => p.toLowerCase() === preset.toLowerCase())
    );
    const custom = parts
      .filter(
        (p) => !PRESETS.some((preset) => preset.toLowerCase() === p.toLowerCase())
      )
      .join(", ");
    return { selected: selected as string[], custom };
  }, []); // parsed once on mount; parent remounts via key when switching offers

  const [selected, setSelected] = useState<string[]>(parsed.selected);
  const [custom, setCustom] = useState(parsed.custom);

  function push(nextSelected: string[], nextCustom: string) {
    const ordered = PRESETS.filter((p) => nextSelected.includes(p));
    onChange([...ordered, nextCustom.trim()].filter(Boolean).join(", "));
  }

  function toggle(preset: string) {
    const next = selected.includes(preset)
      ? selected.filter((p) => p !== preset)
      : [...selected, preset];
    setSelected(next);
    push(next, custom);
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Allowed Traffic</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => toggle(preset)}
              className={cn(
                "rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-gold/50",
                selected.includes(preset) && "border-gold bg-gold/10 text-gold"
              )}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="allowedTrafficCustom">Other / Restrictions (optional)</Label>
        <Input
          id="allowedTrafficCustom"
          placeholder="e.g. No incentivised, SEO only"
          value={custom}
          onChange={(e) => {
            setCustom(e.target.value);
            push(selected, e.target.value);
          }}
        />
      </div>

      <p className="text-xs text-muted">
        Saved as:{" "}
        <span className="font-medium text-gold">
          {[...PRESETS.filter((p) => selected.includes(p)), custom.trim()]
            .filter(Boolean)
            .join(", ") || "— select at least one —"}
        </span>
      </p>
    </div>
  );
}
