import { NextRequest, NextResponse } from "next/server";
import {
  getPublisher,
  revokePublisher,
  safeEqual,
  savePublisherOffer,
  upsertPublisher,
} from "@/lib/publishers";

export const dynamic = "force-dynamic";

/**
 * Called by the Google Apps Script when a team member changes a publisher's
 * Status in the Sheet. Authenticated with a shared secret
 * (PUBLISHER_SYNC_SECRET here, SYNC_SECRET in the script's properties).
 *
 *   { "action": "approve", "username", "password", "companyName", "email" }
 *   { "action": "revoke",  "username" }
 *   { "action": "offer",   "username", "applicationId", "offerId", "offerTitle",
 *                          "status", "did", "platform", "platformId", "publisherId",
 *                          "apiInfo", "notes", "crmAccessEmail", "crmAccess" }
 */
export async function POST(req: NextRequest) {
  const expected = process.env.PUBLISHER_SYNC_SECRET;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "PUBLISHER_SYNC_SECRET is not configured on the server." },
      { status: 500 }
    );
  }
  const given = req.headers.get("x-sync-secret") ?? "";
  if (!safeEqual(given, expected)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim();
    if (!/^[a-z0-9][a-z0-9-]{1,48}$/i.test(username)) {
      return NextResponse.json({ ok: false, error: "Invalid username." }, { status: 400 });
    }

    if (body.action === "approve") {
      const password = String(body.password ?? "");
      if (password.length < 8) {
        return NextResponse.json(
          { ok: false, error: "Password must be at least 8 characters." },
          { status: 400 }
        );
      }
      await upsertPublisher({
        username,
        password,
        companyName: body.companyName,
        email: body.email,
      });
      return NextResponse.json({ ok: true, status: "active" });
    }

    if (body.action === "revoke") {
      await revokePublisher(username);
      return NextResponse.json({ ok: true, status: "revoked" });
    }

    if (body.action === "offer") {
      const applicationId = String(body.applicationId ?? "").trim();
      if (!/^[A-Za-z0-9_-]{4,64}$/.test(applicationId)) {
        return NextResponse.json({ ok: false, error: "Invalid applicationId." }, { status: 400 });
      }
      if (!(await getPublisher(username))) {
        return NextResponse.json({ ok: false, error: "Unknown publisher." }, { status: 404 });
      }
      const saved = await savePublisherOffer(username, {
        applicationId,
        offerId: body.offerId,
        offerTitle: body.offerTitle,
        status: body.status,
        did: body.did,
        platform: body.platform,
        platformId: body.platformId,
        publisherId: body.publisherId,
        apiInfo: body.apiInfo,
        notes: body.notes,
        crmAccessEmail: body.crmAccessEmail,
        crmAccess: body.crmAccess,
      });
      return NextResponse.json({ ok: true, status: saved.status });
    }

    return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("Publisher sync failed:", err);
    return NextResponse.json({ ok: false, error: "Sync failed." }, { status: 500 });
  }
}
