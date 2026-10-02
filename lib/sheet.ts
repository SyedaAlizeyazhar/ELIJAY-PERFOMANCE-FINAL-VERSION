export type SheetTab =
  | "Offer_Applications"
  | "Publishers_Data"
  | "Buyers_Data"
  | "Contact_Queries";

export async function sendToSheet(
  sheetName: SheetTab,
  formData: Record<string, unknown>
) {
  const url = process.env.NEXT_PUBLIC_SHEET_WEBHOOK_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SHEET_WEBHOOK_URL is not configured on the server."
    );
  }

  const payload = {
    sheetName,
    timestamp: new Date().toISOString(),
    ...formData,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // Apps Script webhooks are the usual target here; no-store keeps this fresh.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Sheet webhook responded with ${res.status}`);
  }

  // Apps Script always answers 200, so failures come back as { ok: false }.
  const result = await res.json().catch(() => null);
  if (result && result.ok === false) {
    throw new Error(`Sheet webhook error: ${result.error ?? "unknown"}`);
  }

  return payload;
}
