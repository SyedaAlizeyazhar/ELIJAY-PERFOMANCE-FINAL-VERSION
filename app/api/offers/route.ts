import { NextResponse } from "next/server";
import { getActiveOffers } from "@/lib/kv";
import { getPublisherSession } from "@/lib/publisher-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  // Same rule as the /offers page: approved, logged-in publishers only.
  if (!(await getPublisherSession())) {
    return NextResponse.json({ offers: [], error: "Login required." }, { status: 401 });
  }
  try {
    const offers = await getActiveOffers();
    return NextResponse.json({ offers });
  } catch (err) {
    console.error("Failed to load offers:", err);
    return NextResponse.json({ offers: [] }, { status: 200 });
  }
}
