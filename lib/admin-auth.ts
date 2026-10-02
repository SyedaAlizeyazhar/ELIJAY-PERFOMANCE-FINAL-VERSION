import { cookies } from "next/headers";

export const ADMIN_COOKIE = "epp_admin_session";

// Uses Web Crypto (globalThis.crypto.subtle) so this file works identically
// in Node.js API routes and in the Edge middleware runtime.

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret";
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signToken(): Promise<string> {
  const payload = `admin:${Date.now()}`;
  const sig = await hmac(payload);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [payload, sig] = decoded.split(".");
    if (!payload?.startsWith("admin:")) return false;
    const expected = await hmac(payload);
    return sig === expected;
  } catch {
    return false;
  }
}

export async function isAdminRequest(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifyToken(token);
}
