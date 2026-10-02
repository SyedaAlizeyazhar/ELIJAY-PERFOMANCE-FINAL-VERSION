import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { isAdminRequest } from "@/lib/admin-auth";
import { getActiveOffers, getOffers, getVerticals } from "@/lib/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Admin-only diagnostic view of what is ACTUALLY in KV.
 *
 * Hit /api/admin/debug while logged in to answer, in one request:
 *   - is the key a hash (new format) or still a string (unmigrated)?
 *   - how many offers exist in total vs. how many pass the "active" filter?
 *   - exactly what status string each offer has (quoted, so stray
 *     whitespace/casing is visible)
 *
 * If `totalOffers` is higher than `activeOffers`, the problem is the status
 * value. If `totalOffers` is itself too low, the data never reached KV.
 */
export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [offersKeyType, verticalsKeyType] = await Promise.all([
    kv.type("epp:offers"),
    kv.type("epp:verticals"),
  ]);

  const [offers, active, verticals] = await Promise.all([
    getOffers(),
    getActiveOffers(),
    getVerticals(),
  ]);

  return NextResponse.json({
    keys: {
      "epp:offers": offersKeyType, // expect "hash"
      "epp:verticals": verticalsKeyType, // expect "hash"
    },
    counts: {
      totalOffers: offers.length,
      activeOffers: active.length,
      verticals: verticals.length,
    },
    offers: offers.map((o) => ({
      id: o.id,
      title: o.title,
      vertical: o.vertical,
      status: JSON.stringify(o.status), // quoted to expose casing/whitespace
      paymentTerms: o.paymentTerms ?? null,
      createdAt: o.createdAt,
    })),
    verticals: verticals.map((v) => ({ id: v.id, name: v.name })),
    orphanedVerticals: Array.from(
      new Set(
        offers
          .map((o) => o.vertical)
          .filter((name) => !verticals.some((v) => v.name === name))
      )
    ),
  });
}
