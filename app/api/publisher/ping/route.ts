import { NextRequest, NextResponse } from "next/server";
import { getPublisherSession } from "@/lib/publisher-auth";
import { getPublisherOffer } from "@/lib/publishers";
import { sendPing } from "@/lib/ping";

export const dynamic = "force-dynamic";

/**
 * Sends a test ping for one of the logged-in publisher's accepted offers.
 * The platform and its IDs come from the application record (set by the
 * team in the Sheet), never from the browser.
 *
 *   { "applicationId", "phone", "zip", "state" }
 */
export async function POST(req: NextRequest) {
  const publisher = await getPublisherSession();
  if (!publisher) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const applicationId = String(body.applicationId ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const zip = String(body.zip ?? "").trim();
  const state = String(body.state ?? "").trim().toUpperCase();

  if (!/^[+\d\s().-]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  if (!/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Zip code must be 5 digits." }, { status: 400 });
  }
  if (!/^[A-Z]{2}$/.test(state)) {
    return NextResponse.json({ error: "Use the 2-letter state code, e.g. CA." }, { status: 400 });
  }

  const offer = applicationId ? await getPublisherOffer(publisher.username, applicationId) : null;
  if (!offer || offer.status !== "Accepted") {
    return NextResponse.json({ error: "This offer isn't active for you." }, { status: 404 });
  }
  if (!offer.platform || !offer.platformId || (offer.platform === "Retreaver" && !offer.publisherId)) {
    return NextResponse.json(
      { error: "Your routing for this offer is still being set up." },
      { status: 409 }
    );
  }

  const result = await sendPing(offer, { phone, zip, state });
  return NextResponse.json({ platform: offer.platform, ...result });
}
