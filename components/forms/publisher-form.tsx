"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldRow, FormChapter } from "@/components/forms/form-chapter";

import { CONTACT_PREFS, type ContactPref, type PublisherLead } from "@/lib/types";

const EMPTY: PublisherLead = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  linkedinUrl: "",
  contactPref: "Telegram",
  contactId: "",
  verticalsInterested: "",
  trafficDescription: "",
  ref1Name: "",
  ref1Company: "",
  ref1Contact: "",
  ref2Name: "",
  ref2Company: "",
  ref2Contact: "",
};

const REFERENCES = [
  { n: 1, name: "ref1Name", company: "ref1Company", contact: "ref1Contact" },
  { n: 2, name: "ref2Name", company: "ref2Company", contact: "ref2Contact" },
] as const;

export function PublisherForm() {
  const [form, setForm] = useState<PublisherLead>(EMPTY);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PublisherLead>(key: K, value: PublisherLead[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.verticalsInterested.trim()) {
      toast.error("Tell us which verticals you're interested in.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName: "Publishers_Data",
          ...form,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Application submitted — our team will review shortly.");
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
            <Input id="companyName" required placeholder="Hey Solutions" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input id="companyEmail" type="email" required placeholder="name@company.com" value={form.companyEmail} onChange={(e) => update("companyEmail", e.target.value)} />
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

      <FormChapter numeral="II" title="How We Reach You">
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

      <FormChapter numeral="III" title="Your Traffic">
        <div>
          <Label htmlFor="verticalsInterested">Verticals Interested</Label>
          <Input
            id="verticalsInterested"
            required
            placeholder="Medicare, ACA, Final Expense"
            value={form.verticalsInterested}
            onChange={(e) => update("verticalsInterested", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="trafficDescription">Traffic Description</Label>
          <Textarea
            id="trafficDescription"
            required
            rows={3}
            placeholder="Source of traffic, volume, geo and quality notes"
            value={form.trafficDescription}
            onChange={(e) => update("trafficDescription", e.target.value)}
          />
        </div>
      </FormChapter>

      <FormChapter
        numeral="IV"
        title="References"
        description={
          <>
            Two pay-per-call references are required. Each must be a{" "}
            <span className="text-gold">US-based company or individual</span>,
            or, if not US-based, an{" "}
            <span className="text-gold">established pay-per-call company</span>.
          </>
        }
      >
        {REFERENCES.map((ref) => (
          <div key={ref.n} className="space-y-7">
            <p className="font-serif text-lg italic text-gold/90">Reference {ref.n}</p>
            <FieldRow>
              <div>
                <Label htmlFor={ref.name}>Reference Name</Label>
                <Input
                  id={ref.name}
                  required
                  placeholder="Full name"
                  value={form[ref.name]}
                  onChange={(e) => update(ref.name, e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={ref.company}>Company Name</Label>
                <Input
                  id={ref.company}
                  required
                  placeholder="Company"
                  value={form[ref.company]}
                  onChange={(e) => update(ref.company, e.target.value)}
                />
              </div>
            </FieldRow>
            <div>
              <Label htmlFor={ref.contact}>Contact Information</Label>
              <Input
                id={ref.contact}
                required
                placeholder="Email and/or phone number"
                value={form[ref.contact]}
                onChange={(e) => update(ref.contact, e.target.value)}
              />
            </div>
          </div>
        ))}
      </FormChapter>

      <div className="space-y-6">
        <div className="thread" />
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted">
            Every application is reviewed by our team. Approved publishers
            receive login details for the live offer network.
          </p>
          <Button type="submit" size="lg" shimmer disabled={loading} className="shrink-0 pr-5">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit Application <ArrowOrb />
          </Button>
        </div>
      </div>
    </form>
  );
}
