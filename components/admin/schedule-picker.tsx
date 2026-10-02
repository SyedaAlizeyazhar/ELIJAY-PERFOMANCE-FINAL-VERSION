"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

/**
 * Collapse selected days into the shortest readable label:
 *   all 7            -> "Mon-Sun"
 *   a run of 3+      -> "Mon-Fri"
 *   runs + singles   -> "Mon-Wed, Sat"
 * Selection order doesn't matter; output always follows Mon..Sun.
 */
export function formatDays(selected: Day[]): string {
  const ordered = DAYS.filter((d) => selected.includes(d));
  if (ordered.length === 0) return "";
  if (ordered.length === 7) return "Mon-Sun";

  const runs: Day[][] = [];
  for (const day of ordered) {
    const lastRun = runs[runs.length - 1];
    const prevIndex = lastRun ? DAYS.indexOf(lastRun[lastRun.length - 1]) : -2;
    if (lastRun && DAYS.indexOf(day) === prevIndex + 1) lastRun.push(day);
    else runs.push([day]);
  }

  return runs
    .map((run) =>
      run.length >= 3 ? `${run[0]}-${run[run.length - 1]}` : run.join(", ")
    )
    .join(", ");
}

/** Best-effort parse of an existing "Mon-Fri 09AM-09PM EST" string. */
function parseSchedule(value: string) {
  const result = {
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"] as Day[],
    start: "",
    end: "",
    tz: "EST",
  };
  if (!value?.trim()) return result;

  // times: two tokens like 09AM / 9:30 PM separated by a dash
  const time = value.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*[-–—to]+\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i
  );
  if (time) {
    result.start = time[1].replace(/\s+/g, "").toUpperCase();
    result.end = time[2].replace(/\s+/g, "").toUpperCase();
  }

  // trailing timezone token
  const tz = value.match(/\b([A-Z]{2,4})\s*$/);
  if (tz) result.tz = tz[1];

  // day portion = everything before the first time
  const dayPart = time ? value.slice(0, value.indexOf(time[0])) : value;
  const found: Day[] = [];
  for (const segment of dayPart.split(",")) {
    const range = segment.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s*[-–—]\s*(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i);
    if (range) {
      const a = DAYS.findIndex((d) => d.toLowerCase() === range[1].toLowerCase());
      const b = DAYS.findIndex((d) => d.toLowerCase() === range[2].toLowerCase());
      if (a > -1 && b > -1) for (let i = a; i <= b; i++) found.push(DAYS[i]);
    } else {
      for (const d of DAYS) {
        if (new RegExp(`\\b${d}\\b`, "i").test(segment)) found.push(d);
      }
    }
  }
  if (found.length) result.days = Array.from(new Set(found));

  return result;
}

export function SchedulePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const initial = useMemo(() => parseSchedule(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [days, setDays] = useState<Day[]>(initial.days);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);
  const [tz, setTz] = useState(initial.tz);

  // Compose "Mon-Fri 09AM-09PM EST" and push it up as one string, so the
  // Offer type and KV storage stay unchanged.
  useEffect(() => {
    const dayLabel = formatDays(days);
    const timeLabel = start && end ? `${start}-${end}` : start || end || "";
    const composed = [dayLabel, timeLabel, tz.trim()].filter(Boolean).join(" ");
    if (composed !== value) onChange(composed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, start, end, tz]);

  function toggleDay(day: Day) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  const preview = [formatDays(days), start && end ? `${start}-${end}` : "", tz]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-3">
      <div>
        <Label>Days</Label>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              className={cn(
                "rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-gold/50",
                days.includes(day) && "border-gold bg-gold/10 text-gold"
              )}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="scheduleStart">Start Time</Label>
          <Input
            id="scheduleStart"
            placeholder="09AM"
            value={start}
            onChange={(e) => setStart(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <Label htmlFor="scheduleEnd">End Time</Label>
          <Input
            id="scheduleEnd"
            placeholder="09PM"
            value={end}
            onChange={(e) => setEnd(e.target.value.toUpperCase())}
          />
        </div>
        <div>
          <Label htmlFor="scheduleTz">Timezone</Label>
          <Input
            id="scheduleTz"
            placeholder="EST"
            value={tz}
            onChange={(e) => setTz(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        Saved as:{" "}
        <span className="font-medium text-gold">
          {preview || "— select days and enter times —"}
        </span>
      </p>
    </div>
  );
}
