"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const TEMPLATE = `{
  "offers": [
    {
      "title": "ACA-EN-WT-CPA-BMN15-AP",
      "vertical": "ACA",
      "payout": "$60",
      "geo": "DE, GA, IA, IN, MO, NE, NH, NJ, OH, OK, PA, SC, TN, TX, UT, VA, WI, WV",
      "cap": "NONE",
      "schedule": "Mon-Fri 09AM-09PM EST",
      "breakHours": "12PM-01PM EST",
      "paymentTerms": "Bi-Monthly Net 15",
      "description": "Traffic Qualifiers: Age Under 64, Income under $20k/year.",
      "allowedTraffic": "Warm Transfer, Inbounds",
      "resources": [
        { "label": "ZIP Codes", "url": "https://drive.google.com/file/d/XXXX/view" }
      ],
      "status": "active"
    }
  ]
}`;

/**
 * Paste-and-import for offers.
 *
 * Imported offers are ordinary KV records — nothing flags them as imported, so
 * they can be edited, paused and deleted from the list below exactly like
 * hand-entered ones.
 *
 * Validation is per-row on the server: good rows import, bad rows are reported
 * back with their position, so one typo doesn't reject the whole batch.
 */
export function OffersImport({ onImported }: { onImported: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [skipped, setSkipped] = useState<Array<{ row: number; reason: string }>>([]);

  // live count so you know how many rows you pasted before committing
  let parsedCount: number | null = null;
  try {
    const p = JSON.parse(text);
    if (Array.isArray(p?.offers)) parsedCount = p.offers.length;
  } catch {
    parsedCount = null;
  }

  async function runImport() {
    setBusy(true);
    setSkipped([]);
    try {
      const res = await fetch("/api/admin/offers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const data = await res.json();

      if (!res.ok) {
        setSkipped(data.skipped ?? []);
        toast.error(data.error ?? "Import failed.");
        return;
      }

      setSkipped(data.skipped ?? []);
      toast.success(
        `Imported ${data.added} offer${data.added === 1 ? "" : "s"}.` +
          (data.skipped?.length ? ` ${data.skipped.length} skipped.` : "")
      );
      setText("");
      onImported();
    } catch {
      toast.error("Import failed. Check the JSON and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Offers</CardTitle>
        <CardDescription>
          Paste a JSON list to add many offers at once. Everything imported
          behaves like a normal offer — edit, pause or delete it below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          rows={12}
          spellCheck={false}
          placeholder={TEMPLATE}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="font-mono text-xs"
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={runImport} disabled={busy || !text.trim()}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Import
          </Button>
          <Button
            variant="ghost"
            onClick={() => setText(TEMPLATE)}
            disabled={busy}
          >
            <FileJson className="h-4 w-4" /> Load template
          </Button>
          {parsedCount !== null && (
            <span className="text-xs text-muted">
              {parsedCount} offer{parsedCount === 1 ? "" : "s"} ready
            </span>
          )}
          {text.trim() && parsedCount === null && (
            <span className="text-xs text-danger">
              Not valid JSON yet
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted">
          Required on every row: <code className="text-gold">title</code>,{" "}
          <code className="text-gold">vertical</code>,{" "}
          <code className="text-gold">payout</code>,{" "}
          <code className="text-gold">geo</code>,{" "}
          <code className="text-gold">cap</code>. Everything else is optional
          and defaults to empty. <code className="text-gold">status</code>{" "}
          defaults to active. <code className="text-gold">resources</code> takes
          up to 10 label + url pairs; non-http links are dropped. Max 200 rows
          per batch.
        </p>

        {skipped.length > 0 && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 p-4">
            <p className="mb-2 text-xs font-semibold text-danger">
              {skipped.length} row{skipped.length === 1 ? "" : "s"} skipped
            </p>
            <ul className="space-y-1 text-xs text-muted">
              {skipped.slice(0, 10).map((s) => (
                <li key={s.row}>
                  Row {s.row}: {s.reason}
                </li>
              ))}
              {skipped.length > 10 && <li>…and {skipped.length - 10} more</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
