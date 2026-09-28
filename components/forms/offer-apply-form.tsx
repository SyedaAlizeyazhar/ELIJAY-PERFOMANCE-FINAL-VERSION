"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldRow, FormChapter } from "@/components/forms/form-chapter";
import { CONTACT_PREFS, type ContactPref, type OfferApplicationLead } from "@/lib/types";

export function OfferApplyForm({
  offerId,
  offerTitle,
  defaultCompanyName = "",
  defaultCompanyEmail = "",
}: {
  offerId: string;
  offerTitle: string;
  /** Pre-filled from the logged-in publisher's account. */
  defaultCompanyName?: string;
  defaultCompanyEmail?: string;
}) {
  const router = useRouter();
  const EMPTY: OfferApplicationLead = {
    offerId,
    offerTitle,
    companyName: defaultCompanyName,
    companyEmail: defaultCompanyEmail,
    companyPhone: "",
    dailyVolume: "",
    rpc: "",
    dataSampleLink: "",
    callRecordingLink: "",
    sourceUrlLink: "",
    scriptLink: "",
    contactPref: "Telegram",
    contactId: "",
    linkedinUrl: "",
    crmAccessEmail: defaultCompanyEmail,
  };

  const [form, setForm] = useState<OfferApplicationLead>(EMPTY);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof OfferApplicationLead>(
    key: K,
    value: OfferApplicationLead[K]
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetName: "Offer_Applications", ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Application sent — our team will follow up shortly.");
      setForm(EMPTY);
      router.refresh(); // swap the form for the "under review" status
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-14">
      <FormChapter numeral="I" title="Your Company">
        <FieldRow>
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" required value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input id="companyEmail" type="email" required value={form.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} />
          </div>
        </FieldRow>
        <FieldRow>
          <div>
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input id="companyPhone" type="tel" required placeholder="(555) 010-2030" value={form.companyPhone} onChange={(e) => update("companyPhone", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input id="linkedinUrl" type="url" required placeholder="https://linkedin.com/company/…" value={form.linkedinUrl} onChange={(e) => update("linkedinUrl", e.target.value)} />
          </div>
        </FieldRow>
      </FormChapter>

      <FormChapter numeral="II" title="Your Traffic">
        <FieldRow>
          <div>
            <Label htmlFor="dailyVolume">Daily Volume</Label>
            <Input id="dailyVolume" required placeholder="150 calls / day" value={form.dailyVolume} onChange={(e) => update("dailyVolume", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rpc">RPC</Label>
            <Input id="rpc" required placeholder="Revenue per call" value={form.rpc} onChange={(e) => update("rpc", e.target.value)} />
          </div>
        </FieldRow>
      </FormChapter>

      <FormChapter
        numeral="III"
        title="Proof of Quality"
        description="Google Drive links our team can open."
      >
        <FieldRow>
          <div>
            <Label htmlFor="dataSampleLink">Data Sample</Label>
            <Input id="dataSampleLink" type="url" required placeholder="https://drive.google.com/…" value={form.dataSampleLink} onChange={(e) => update("dataSampleLink", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="callRecordingLink">Call Recording</Label>
            <Input id="callRecordingLink" type="url" required placeholder="https://drive.google.com/…" value={form.callRecordingLink} onChange={(e) => update("callRecordingLink", e.target.value)} />
          </div>
        </FieldRow>
        <FieldRow>
          <div>
            <Label htmlFor="sourceUrlLink">Source URL</Label>
            <Input id="sourceUrlLink" type="url" required placeholder="https://drive.google.com/…" value={form.sourceUrlLink} onChange={(e) => update("sourceUrlLink", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="scriptLink">Script</Label>
            <Input id="scriptLink" type="url" required placeholder="https://drive.google.com/…" value={form.scriptLink} onChange={(e) => update("scriptLink", e.target.value)} />
          </div>
        </FieldRow>
      </FormChapter>

      <FormChapter numeral="IV" title="How We Reach You">
        <FieldRow>
          <div>
            <Label htmlFor="contactPref">Contact Preference</Label>
            <Select
              value={form.contactPref}
              onValueChange={(v) => update("contactPref", v as ContactPref)}
            >
              <SelectTrigger id="contactPref">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_PREFS.map((pref) => (
                  <SelectItem key={pref} value={pref}>
                    {pref}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contactId">Contact ID</Label>
            <Input id="contactId" required placeholder="@handle, number or Teams email" value={form.contactId} onChange={(e) => update("contactId", e.target.value)} />
          </div>
        </FieldRow>
      </FormChapter>

      <FormChapter
        numeral="V"
        title="Reporting Access"
        description="Once you're approved, we'll share reporting access on the offer's CRM (Ringba, Retreaver or CallGrid) with this email."
      >
        <div>
          <Label htmlFor="crmAccessEmail">CRM Access Email</Label>
          <Input id="crmAccessEmail" type="email" required placeholder="reporting@yourcompany.com" value={form.crmAccessEmail} onChange={(e) => update("crmAccessEmail", e.target.value)} />
        </div>
      </FormChapter>

      <div className="space-y-6">
        <div className="thread" />
        <Button type="submit" size="lg" shimmer disabled={loading} className="w-full pr-5 sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Apply for This Offer <ArrowOrb />
        </Button>
      </div>
    </form>
  );
}
