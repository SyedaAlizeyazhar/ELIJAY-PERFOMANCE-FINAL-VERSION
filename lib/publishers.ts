import { kv } from "@vercel/kv";
import { unstable_noStore as noStore } from "next/cache";
import {
  CRM_PLATFORMS,
  type CrmAccessStatus,
  type CrmPlatform,
  type OfferApplicationStatus,
  type PublisherOffer,
} from "./types";

// ---------------------------------------------------------------------------
// Publisher accounts.
//
// Accounts are created and revoked from the Google Sheet: when a team member
// sets a publisher's Status to "Approved", the Apps Script generates a
// username + password and POSTs them to /api/publishers/sync, which lands
// here. Only a PBKDF2 hash of the password is stored.
//
// Stored as one Redis HASH (field = lower-case username), same pattern as
// offers in lib/kv.ts, so writing one account can never touch another.
// ---------------------------------------------------------------------------

const PUBLISHERS_KEY = "epp:publishers";
const PBKDF2_ITERATIONS = 100_000;

export interface PublisherAccount {
  username: string;
  companyName: string;
  email: string;
  passwordHash: string;
  salt: string;
  active: boolean;
  /** ms timestamp; sessions issued before this are rejected. */
  passwordSetAt: number;
  updatedAt: string;
}

export function normalizeUsername(username: string) {
  return String(username ?? "").trim().toLowerCase();
}

function toHex(buf: ArrayBuffer | Uint8Array) {
  return Array.from(buf instanceof Uint8Array ? buf : new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

async function pbkdf2(password: string, salt: Uint8Array<ArrayBuffer>) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return toHex(bits);
}

/** Constant-time string compare, so a wrong password can't be timed. */
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function coerce(value: unknown): PublisherAccount | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as PublisherAccount;
    } catch {
      return null;
    }
  }
  return value as PublisherAccount;
}

export async function getPublisher(username: string): Promise<PublisherAccount | null> {
  noStore();
  const name = normalizeUsername(username);
  if (!name) return null;
  return coerce(await kv.hget(PUBLISHERS_KEY, name));
}

/** Create or re-activate an account and set its password. */
export async function upsertPublisher(input: {
  username: string;
  password: string;
  companyName?: string;
  email?: string;
}): Promise<PublisherAccount> {
  const username = normalizeUsername(input.username);
  const existing = await getPublisher(username);

  // Keep the old hash (and live sessions) if the password didn't change.
  let { passwordHash, salt, passwordSetAt } = existing ?? {
    passwordHash: "",
    salt: "",
    passwordSetAt: 0,
  };
  const unchanged =
    existing && safeEqual(await pbkdf2(input.password, fromHex(existing.salt)), existing.passwordHash);
  if (!unchanged) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
    salt = toHex(saltBytes);
    passwordHash = await pbkdf2(input.password, saltBytes);
    passwordSetAt = Date.now();
  }

  const account: PublisherAccount = {
    username,
    companyName: String(input.companyName ?? existing?.companyName ?? "").trim(),
    email: String(input.email ?? existing?.email ?? "").trim(),
    passwordHash,
    salt,
    active: true,
    passwordSetAt,
    updatedAt: new Date().toISOString(),
  };
  await kv.hset(PUBLISHERS_KEY, { [username]: account });
  return account;
}

/** Block logins and end existing sessions; the record is kept for re-approval. */
export async function revokePublisher(username: string): Promise<boolean> {
  const existing = await getPublisher(username);
  if (!existing) return false;
  await kv.hset(PUBLISHERS_KEY, {
    [existing.username]: { ...existing, active: false, updatedAt: new Date().toISOString() },
  });
  return true;
}

/** Returns the account if the credentials are right and it is active. */
export async function checkPublisherLogin(
  username: string,
  password: string
): Promise<PublisherAccount | null> {
  const account = await getPublisher(username);
  if (!account || !account.active || !account.salt) return null;
  const hash = await pbkdf2(String(password ?? ""), fromHex(account.salt));
  return safeEqual(hash, account.passwordHash) ? account : null;
}

// ---------------------------------------------------------------------------
// Offer applications per publisher.
//
// One hash per publisher (field = applicationId). Created as Pending when
// they apply; the team then sets Accepted/Rejected, the DID, the platform
// (Ringba / Retreaver / CallGrid) with its IDs, and whether CRM reporting
// access was sent, in the Offer_Applications tab. The Apps Script syncs them
// here so the publisher sees them on their dashboard.
// ---------------------------------------------------------------------------

const offersKey = (username: string) => `epp:pub-offers:${normalizeUsername(username)}`;

export function newApplicationId() {
  return `app_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeApplicationStatus(value: unknown): OfferApplicationStatus {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "accepted" || v === "approved" || v === "active") return "Accepted";
  if (v === "rejected") return "Rejected";
  return "Pending";
}

export function normalizePlatform(value: unknown): CrmPlatform | "" {
  const v = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "");
  return CRM_PLATFORMS.find((p) => p.toLowerCase() === v) ?? "";
}

export function normalizeCrmAccess(value: unknown): CrmAccessStatus {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "sent" || v === "yes" || v === "done" ? "Sent" : "Pending";
}

/** Legacy records (before platforms) stored the Ringba RTB ID as `rtbId`. */
type StoredOffer = Partial<PublisherOffer> & { rtbId?: string };

function coerceOffer(value: unknown): PublisherOffer | null {
  if (value == null) return null;
  let raw: StoredOffer;
  if (typeof value === "string") {
    try {
      raw = JSON.parse(value) as StoredOffer;
    } catch {
      return null;
    }
  } else {
    raw = value as StoredOffer;
  }
  const legacyRtb = raw.rtbId ?? "";
  return {
    applicationId: raw.applicationId ?? "",
    offerId: raw.offerId ?? "",
    offerTitle: raw.offerTitle ?? "",
    status: normalizeApplicationStatus(raw.status),
    did: raw.did ?? "",
    platform: normalizePlatform(raw.platform) || (legacyRtb ? "Ringba" : ""),
    platformId: raw.platformId || legacyRtb,
    publisherId: raw.publisherId ?? "",
    apiInfo: raw.apiInfo ?? "",
    notes: raw.notes ?? "",
    crmAccessEmail: raw.crmAccessEmail ?? "",
    crmAccess: normalizeCrmAccess(raw.crmAccess),
    appliedAt: raw.appliedAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

export async function getPublisherOffer(
  username: string,
  applicationId: string
): Promise<PublisherOffer | null> {
  noStore();
  return coerceOffer(await kv.hget(offersKey(username), applicationId));
}

export async function getPublisherOffers(username: string): Promise<PublisherOffer[]> {
  noStore();
  const map = await kv.hgetall<Record<string, unknown>>(offersKey(username));
  if (!map) return [];
  return Object.values(map)
    .map(coerceOffer)
    .filter((o): o is PublisherOffer => o !== null)
    .sort((a, b) => (b.appliedAt ?? "").localeCompare(a.appliedAt ?? ""));
}

/** Create or update one application (single-field write). */
export async function savePublisherOffer(
  username: string,
  input: Partial<PublisherOffer> & { applicationId: string }
): Promise<PublisherOffer> {
  const key = offersKey(username);
  const existing = coerceOffer(await kv.hget(key, input.applicationId));
  const now = new Date().toISOString();
  const str = (v: unknown, fallback = "") => (v === undefined ? fallback : String(v ?? "").trim());

  const record: PublisherOffer = {
    applicationId: input.applicationId,
    offerId: str(input.offerId, existing?.offerId ?? ""),
    offerTitle: str(input.offerTitle, existing?.offerTitle ?? ""),
    status: normalizeApplicationStatus(input.status ?? existing?.status),
    did: str(input.did, existing?.did ?? ""),
    platform:
      input.platform === undefined ? existing?.platform ?? "" : normalizePlatform(input.platform),
    platformId: str(input.platformId, existing?.platformId ?? ""),
    publisherId: str(input.publisherId, existing?.publisherId ?? ""),
    apiInfo: str(input.apiInfo, existing?.apiInfo ?? ""),
    notes: str(input.notes, existing?.notes ?? ""),
    crmAccessEmail: str(input.crmAccessEmail, existing?.crmAccessEmail ?? ""),
    crmAccess: normalizeCrmAccess(input.crmAccess ?? existing?.crmAccess),
    appliedAt: existing?.appliedAt ?? str(input.appliedAt, now) ?? now,
    updatedAt: now,
  };
  await kv.hset(key, { [record.applicationId]: record });
  return record;
}
