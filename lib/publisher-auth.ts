import { cookies } from "next/headers";
import { getPublisher, safeEqual, type PublisherAccount } from "./publishers";

export const PUBLISHER_COOKIE = "epp_publisher_session";
export const PUBLISHER_SESSION_DAYS = 7;

// Signed with ADMIN_SESSION_SECRET plus a "publisher" suffix, so a publisher
// token can never be replayed as an admin session (or the other way round).
function secret() {
  return `${process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret"}|publisher`;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signPublisherToken(username: string): Promise<string> {
  const payload = `pub:${username}:${Date.now()}`;
  return Buffer.from(`${payload}.${await hmac(payload)}`).toString("base64url");
}

/** Signature + expiry only. Returns the username and issue time. */
async function readToken(token: string | undefined) {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const dot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, dot);
    const sig = decoded.slice(dot + 1);
    if (!safeEqual(sig, await hmac(payload))) return null;

    const [kind, username, issued] = payload.split(":");
    const issuedAt = Number(issued);
    if (kind !== "pub" || !username || !Number.isFinite(issuedAt)) return null;
    if (Date.now() - issuedAt > PUBLISHER_SESSION_DAYS * 86_400_000) return null;
    return { username, issuedAt };
  } catch {
    return null;
  }
}

/**
 * The logged-in publisher, or null. Also checks the account in KV, so
 * setting a publisher to Rejected in the Sheet (or changing their password)
 * ends their session on the next page load.
 */
export async function getPublisherSession(): Promise<PublisherAccount | null> {
  const token = await readToken(cookies().get(PUBLISHER_COOKIE)?.value);
  if (!token) return null;
  try {
    const account = await getPublisher(token.username);
    if (!account || !account.active) return null;
    if (token.issuedAt < account.passwordSetAt) return null;
    return account;
  } catch {
    return null;
  }
}
