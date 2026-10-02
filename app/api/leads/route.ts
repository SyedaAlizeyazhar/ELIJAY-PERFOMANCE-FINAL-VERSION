import { NextRequest, NextResponse } from "next/server";
import { sendToSheet, type SheetTab } from "@/lib/sheet";
import { getPublisherSession } from "@/lib/publisher-auth";
import { newApplicationId, savePublisherOffer } from "@/lib/publishers";

const VALID_TABS: SheetTab[] = [
  "Offer_Applications",
  "Publishers_Data",
  "Buyers_Data",
  "Contact_Queries",
];

// Columns only the team (or the server) may set. Anything a browser sends
// under these names is dropped, so nobody can approve themselves.
const RESERVED_KEYS = [
  "status",
  "username",
  "password",
  "portal",
  "did",
  "rtbId",
  "platform",
  "platformId",
  "publisherId",
  "apiInfo",
  "notes",
  "crmAccess",
  "publisherUsername",
  "applicationId",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sheetName, ...formData } = body ?? {};

    if (!VALID_TABS.includes(sheetName)) {
      return NextResponse.json(
        { error: "Invalid or missing sheetName." },
        { status: 400 }
      );
    }
    for (const key of RESERVED_KEYS) delete formData[key];

    // Offer applications come from logged-in publishers only, and are tied
    // to their account so accepted offers show up on their dashboard.
    if (sheetName === "Offer_Applications") {
      const publisher = await getPublisherSession();
      if (!publisher) {
        return NextResponse.json(
          { error: "Please log in as a publisher to apply." },
          { status: 401 }
        );
      }
      const applicationId = newApplicationId();
      await sendToSheet(sheetName, {
        ...formData,
        applicationId,
        publisherUsername: publisher.username,
      });
      await savePublisherOffer(publisher.username, {
        applicationId,
        offerId: formData.offerId,
        offerTitle: formData.offerTitle,
        crmAccessEmail: formData.crmAccessEmail,
        status: "Pending",
      });
      return NextResponse.json({ ok: true, applicationId });
    }

    await sendToSheet(sheetName, formData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead submission failed:", err);
    return NextResponse.json(
      { error: "Failed to submit. Please try again." },
      { status: 500 }
    );
  }
}
