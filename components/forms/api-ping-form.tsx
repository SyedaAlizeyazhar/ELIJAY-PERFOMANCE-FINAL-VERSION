"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CrmPlatform } from "@/lib/types";

interface Result {
  success: boolean;
  statusCode: number | null;
  response: unknown;
}

/** Caller details for a test ping; the offer's IDs are added server-side. */
export function ApiPingForm({
  applicationId,
  platform,
}: {
  applicationId: string;
  platform: CrmPlatform;
}) {
  const [form, setForm] = useState({ phone: "", zip: "", state: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/publisher/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't send the ping.");
        return;
      }
      setResult(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const responseText = result ? JSON.stringify(result.response, null, 2) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the text is still selectable */
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-8">
        <div>
          <Label htmlFor="phone">Caller Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            required
            placeholder="+1 555 123 4567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          <div>
            <Label htmlFor="zip">Zip Code</Label>
            <Input
              id="zip"
              required
              inputMode="numeric"
              maxLength={5}
              placeholder="90210"
              value={form.zip}
              onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              required
              maxLength={2}
              placeholder="CA"
              value={form.state}
              onChange={(e) => update("state", e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <Button type="submit" size="lg" shimmer disabled={loading} className="w-full pr-5 sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending ping…" : `Send Test Ping to ${platform}`} <ArrowOrb />
        </Button>
      </form>

      {result && (
        <div className="mt-10" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p
              className={cn(
                "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]",
                result.success ? "text-emerald-teal" : "text-danger"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  result.success ? "bg-emerald-teal" : "bg-danger"
                )}
              />
              {result.success ? "Success" : "Failed"}
              {result.statusCode !== null && ` · ${result.statusCode}`}
            </p>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-xs text-gold/80 transition-colors hover:text-gold"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy response"}
            </button>
          </div>
          <div className="thread mt-3" />
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-muted">
            {responseText}
          </pre>
        </div>
      )}
    </div>
  );
}
