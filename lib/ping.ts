import type { PublisherOffer } from "./types";

// ---------------------------------------------------------------------------
// Test pings to the offer's CRM, sent server to server so the browser never
// talks to Ringba / Retreaver / CallGrid directly (no CORS, keys stay here).
// ---------------------------------------------------------------------------

export interface Caller {
  phone: string;
  zip: string;
  state: string;
}

export interface PingResult {
  success: boolean;
  statusCode: number | null;
  response: unknown;
}

interface CrmRequest {
  url: string;
  headers: Record<string, string>;
  body: Record<string, string>;
}

function buildRequest(offer: PublisherOffer, { phone, zip, state }: Caller): CrmRequest | null {
  const id = encodeURIComponent(offer.platformId);
  switch (offer.platform) {
    case "Ringba":
      // RTB ID = the segment before ".json" in the Ringba RTB endpoint URL.
      return {
        url: `https://rtb.ringba.com/v1/production/${id}.json`,
        headers: { "Content-Type": "application/json" },
        body: { CID: phone, State: state, ZipCode: zip, exposeCallerId: "yes" },
      };
    case "Retreaver":
      // The API key is Retreaver's postback key and goes in the query string.
      return {
        url: `https://rtb.retreaver.com/rtbs.json?key=${id}`,
        headers: { "Content-Type": "application/json" },
        body: {
          publisher_id: offer.publisherId,
          caller_number: phone,
          caller_zip: zip,
          caller_state: state,
        },
      };
    case "CallGrid":
      // The Grid ID in the path is CallGrid's only identity; no key needed.
      return {
        url: `https://bid.callgrid.com/api/bid/${id}`,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: { CallerId: phone, InboundStateCode: state, InboundZipCode: zip },
      };
    default:
      return null;
  }
}

export async function sendPing(offer: PublisherOffer, caller: Caller): Promise<PingResult> {
  const req = buildRequest(offer, caller);
  if (!req) {
    return { success: false, statusCode: null, response: { error: "Unknown platform." } };
  }

  try {
    const upstream = await fetch(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify(req.body),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const text = await upstream.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* upstream didn't return JSON — show the raw text */
    }
    return {
      success: upstream.ok,
      statusCode: upstream.status,
      response: { requestSent: req.body, body },
    };
  } catch (err) {
    // Network-level failure reaching the CRM (DNS, timeout, etc.)
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    return {
      success: false,
      statusCode: null,
      response: {
        requestSent: req.body,
        error: timedOut
          ? `${offer.platform} didn't answer within 20 seconds.`
          : err instanceof Error
            ? err.message
            : "Network error contacting the CRM.",
      },
    };
  }
}
