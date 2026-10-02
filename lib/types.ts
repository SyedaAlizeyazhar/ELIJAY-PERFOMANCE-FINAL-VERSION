export type OfferStatus = "active" | "paused";

/** A labelled link attached to an offer — ZIP code lists, scripts, samples. */
export interface OfferResource {
  label: string;
  url: string;
}

export interface Offer {
  id: string;
  title: string;
  vertical: string;
  payout: string;
  geo: string;
  cap: string;
  schedule: string;
  description: string;
  allowedTraffic: string;
  breakHours: string;
  paymentTerms: string;
  resources: OfferResource[];
  status: OfferStatus;
  createdAt: string;
}

export interface Vertical {
  id: string;
  name: string;
  createdAt: string;
}

export type ContactPref = "Telegram" | "WhatsApp" | "Teams";

export const CONTACT_PREFS: ContactPref[] = ["Telegram", "WhatsApp", "Teams"];

export interface OfferApplicationLead {
  offerId: string;
  offerTitle: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  dailyVolume: string;
  rpc: string;
  dataSampleLink: string;
  callRecordingLink: string;
  sourceUrlLink: string;
  scriptLink: string;
  contactPref: ContactPref;
  contactId: string;
  linkedinUrl: string;
  /** Where we send the publisher's reporting login for the offer's CRM. */
  crmAccessEmail: string;
}

export interface PublisherLead {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  linkedinUrl: string;
  contactPref: ContactPref;
  contactId: string;
  verticalsInterested: string;
  trafficDescription: string;
  // Two pay-per-call references: US-based company/individual, or an
  // established pay-per-call company if not US-based.
  ref1Name: string;
  ref1Company: string;
  ref1Contact: string;
  ref2Name: string;
  ref2Company: string;
  ref2Contact: string;
}

/** Status the team sets on an offer application in the Sheet. */
export type OfferApplicationStatus = "Pending" | "Accepted" | "Rejected";

/** The CRM an offer runs on; decides which ID the publisher gets. */
export type CrmPlatform = "Ringba" | "Retreaver" | "CallGrid";

export const CRM_PLATFORMS: CrmPlatform[] = ["Ringba", "Retreaver", "CallGrid"];

/** What the Sheet's platformId / publisherId columns mean per platform. */
export const PLATFORM_FIELDS: Record<CrmPlatform, { id: string; publisherId?: string }> = {
  Ringba: { id: "RTB ID" },
  Retreaver: { id: "API Key", publisherId: "Publisher ID" },
  CallGrid: { id: "Grid ID" },
};

/** Set by the team in the Sheet once the reporting login has been emailed. */
export type CrmAccessStatus = "Pending" | "Sent";

/**
 * A publisher's application to one offer, as shown on their dashboard.
 * Created when they apply; status and routing details (DID, platform and
 * its IDs) are filled in by the team in the Sheet and synced here.
 */
export interface PublisherOffer {
  applicationId: string;
  offerId: string;
  offerTitle: string;
  status: OfferApplicationStatus;
  did: string;
  platform: CrmPlatform | "";
  /** RTB ID (Ringba), API Key (Retreaver) or Grid ID (CallGrid). */
  platformId: string;
  /** Retreaver only. */
  publisherId: string;
  apiInfo: string;
  notes: string;
  crmAccessEmail: string;
  crmAccess: CrmAccessStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface BuyerLead {
  companyName: string;
  contactPerson: string;
  companyEmail: string;
  companyPhone: string;
  contactId: string;
  offerName: string;
  offerDetails: string;
  vertical: string;
  geoStates: string;
  zipCodes: string;
  payoutRpc: string;
  capVolume: string;
  offerLinkIvr: string;
  notes: string;
}

export interface ContactLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
}
