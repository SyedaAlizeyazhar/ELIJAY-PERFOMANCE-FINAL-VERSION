"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldRow, FormChapter } from "@/components/forms/form-chapter";
import type { BuyerLead } from "@/lib/types";

const EMPTY: BuyerLead = {
  companyName: "",
  contactPerson: "",
  companyEmail: "",
  companyPhone: "",
  contactId: "",
  offerName: "",
  offerDetails: "",
  vertical: "",
  geoStates: "",
  zipCodes: "",
  payoutRpc: "",
  capVolume: "",
  offerLinkIvr: "",
  notes: "",
};

export function BuyerForm() {
  const [form, setForm] = useState<BuyerLead>(EMPTY);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof BuyerLead>(key: K, value: BuyerLead[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetName: "Buyers_Data", ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Offer submitted — our team reviews every submission.");
      setForm(EMPTY);
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
            <Input id="companyName" required placeholder="Company" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" required placeholder="Full name" value={form.contactPerson} onChange={(e) => update("contactPerson", e.target.value)} />
          </div>
        </FieldRow>
        <FieldRow>
          <div>
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input id="companyEmail" type="email" required placeholder="name@company.com" value={form.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input id="companyPhone" type="tel" required placeholder="(555) 010-2030" value={form.companyPhone} onChange={(e) => update("companyPhone", e.target.value)} />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor="contactId">Telegram / WhatsApp / Teams ID</Label>
          <Input id="contactId" required placeholder="@handle, number or Teams email" value={form.contactId} onChange={(e) => update("contactId", e.target.value)} />
        </div>
      </FormChapter>

      <FormChapter numeral="II" title="The Offer">
        <FieldRow>
          <div>
            <Label htmlFor="offerName">Offer Name</Label>
            <Input id="offerName" required placeholder="Medicare Inbound — Tier 1" value={form.offerName} onChange={(e) => update("offerName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="vertical">Vertical</Label>
            <Input id="vertical" required placeholder="Medicare, Home Insurance" value={form.vertical} onChange={(e) => update("vertical", e.target.value)} />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor="offerDetails">Offer Details</Label>
          <Textarea id="offerDetails" required rows={3} placeholder="Qualifications, buffer, hours and anything publishers should know" value={form.offerDetails} onChange={(e) => update("offerDetails", e.target.value)} />
        </div>
        <FieldRow>
          <div>
            <Label htmlFor="payoutRpc">Payout / RPC</Label>
            <Input id="payoutRpc" required placeholder="$45 per call" value={form.payoutRpc} onChange={(e) => update("payoutRpc", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="capVolume">Cap / Volume</Label>
            <Input id="capVolume" required placeholder="100 calls / day" value={form.capVolume} onChange={(e) => update("capVolume", e.target.value)} />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor="offerLinkIvr">Offer Link / IVR</Label>
          <Input id="offerLinkIvr" required placeholder="Link or IVR number" value={form.offerLinkIvr} onChange={(e) => update("offerLinkIvr", e.target.value)} />
        </div>
      </FormChapter>

      <FormChapter numeral="III" title="Targeting">
        <FieldRow>
          <div>
            <Label htmlFor="geoStates">Geo / States</Label>
            <Input id="geoStates" required placeholder="TX, FL, GA" value={form.geoStates} onChange={(e) => update("geoStates", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="zipCodes">Zip Codes</Label>
            <Input id="zipCodes" placeholder="Optional — comma separated" value={form.zipCodes} onChange={(e) => update("zipCodes", e.target.value)} />
          </div>
        </FieldRow>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} placeholder="Optional" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
        </div>
      </FormChapter>

      <div className="space-y-6">
        <div className="thread" />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted">
            Our team reviews every submission before it goes live on the network.
          </p>
          <Button type="submit" size="lg" shimmer disabled={loading} className="shrink-0 pr-5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit Offer <ArrowOrb />
          </Button>
        </div>
      </div>
    </form>
  );
}
