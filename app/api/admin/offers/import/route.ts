import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { addOffers } from "@/lib/kv";
import type { Offer } from "@/lib/types";

export const dynamic = "force-dynamic";

const REQUIRED = ["title", "vertical", "payout", "geo", "cap"] as const;

/**
 * Bulk offer import. Accepts { offers: [...] }.
 *
 * Validation is per-row rather than all-or-nothing: valid rows import, invalid
 * rows come back with their index and what's missing, so a single typo in row
 * 40 doesn't reject the other 39. Optional fields are defaulted rather than
 * rejected, since most bulk sources won't carry every column.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body is not valid JSON." }, { status: 400 });
  }

  const raw = (body as { offers?: unknown })?.offers;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      { error: 'Expected an object shaped { "offers": [ ... ] }.' },
      { status: 400 }
    );
  }
  if (raw.length === 0) {
    return NextResponse.json({ error: "No offers in the list." }, { status: 400 });
  }
  if (raw.length > 200) {
    return NextResponse.json(
      { error: "Import is capped at 200 offers per batch." },
      { status: 400 }
    );
  }

  const valid: Array<Omit<Offer, "id" | "createdAt">> = [];
  const skipped: Array<{ row: number; reason: string }> = [];

  raw.forEach((item, i) => {
    if (typeof item !== "object" || item === null) {
      skipped.push({ row: i + 1, reason: "Not an object" });
      return;
    }
    const o = item as Record<string, unknown>;
    const missing = REQUIRED.filter(
      (f) => typeof o[f] !== "string" || !(o[f] as string).trim()
    );
    if (missing.length > 0) {
      skipped.push({ row: i + 1, reason: `Missing: ${missing.join(", ")}` });
      return;
    }

    valid.push({
      title: String(o.title).trim(),
      vertical: String(o.vertical).trim(),
      payout: String(o.payout).trim(),
      geo: String(o.geo).trim(),
      cap: String(o.cap).trim(),
      schedule: String(o.schedule ?? "").trim(),
      description: String(o.description ?? "").trim(),
      allowedTraffic: String(o.allowedTraffic ?? "").trim(),
      breakHours: String(o.breakHours ?? "").trim(),
      paymentTerms: String(o.paymentTerms ?? "").trim(),
      resources: Array.isArray(o.resources) ? (o.resources as Offer["resources"]) : [],
      status:
        String(o.status ?? "active").trim().toLowerCase() === "paused"
          ? "paused"
          : "active",
    });
  });

  if (valid.length === 0) {
    return NextResponse.json(
      { error: "No valid rows found.", skipped },
      { status: 400 }
    );
  }

  const { offers, added } = await addOffers(valid);

  revalidatePath("/offers");
  revalidatePath("/");

  return NextResponse.json({ offers, added, skipped });
}
