"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OfferResource } from "@/lib/types";

const PRESET_LABELS = [
  "ZIP Codes",
  "Script",
  "Data Sample",
  "Call Recording",
  "Compliance Doc",
];

/**
 * Repeatable label + URL rows for the links attached to an offer — ZIP code
 * lists, scripts, sample recordings.
 *
 * Rows are edited in place rather than added to a separate list, so the order
 * you enter is the order publishers see. Empty rows are harmless: the server
 * drops anything without a valid http(s) URL before it reaches KV.
 */
export function ResourceLinks({
  value,
  onChange,
}: {
  value: OfferResource[];
  onChange: (next: OfferResource[]) => void;
}) {
  function update(i: number, patch: Partial<OfferResource>) {
    onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function add() {
    if (value.length >= 10) return;
    onChange([...value, { label: "", url: "" }]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Resource Links</Label>
        <p className="-mt-1 mb-2 text-xs text-muted">
          Drive links shown as buttons on the offer page — ZIP codes, scripts,
          samples. Optional.
        </p>
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted">No links added.</p>
      )}

      {value.map((r, i) => {
        const badUrl = r.url.trim() !== "" && !/^https?:\/\//i.test(r.url.trim());
        return (
          <div key={i} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-start">
            <Input
              placeholder="Label (e.g. ZIP Codes)"
              list={`resource-labels-${i}`}
              value={r.label}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <datalist id={`resource-labels-${i}`}>
              {PRESET_LABELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
            <div>
              <Input
                placeholder="https://drive.google.com/..."
                value={r.url}
                onChange={(e) => update(i, { url: e.target.value })}
                className={badUrl ? "border-danger/60" : undefined}
              />
              {badUrl && (
                <p className="mt-1 text-xs text-danger">
                  Must start with http:// or https://
                </p>
              )}
            </div>
            <Button
              type="button"
              size="icon"
              variant="danger"
              onClick={() => remove(i)}
              aria-label="Remove link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      })}

      <Button
        type="button"
        size="sm"
        variant="subtle"
        onClick={add}
        disabled={value.length >= 10}
      >
        <Plus className="h-3.5 w-3.5" /> Add link
      </Button>
    </div>
  );
}
