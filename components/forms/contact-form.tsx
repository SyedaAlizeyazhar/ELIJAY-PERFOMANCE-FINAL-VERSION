"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowOrb } from "@/components/ui/arrow-orb";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldRow } from "@/components/forms/form-chapter";
import type { ContactLead } from "@/lib/types";

const EMPTY: ContactLead = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  reason: "",
};

export function ContactForm() {
  const [form, setForm] = useState<ContactLead>(EMPTY);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ContactLead>(key: K, value: ContactLead[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetName: "Contact_Queries", ...form }),
      });
      if (!res.ok) throw new Error();
      toast.success("Message sent — we'll get back to you shortly.");
      setForm(EMPTY);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <p className="font-serif text-2xl italic text-gold">Write to us</p>
      <FieldRow>
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" required value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
        </div>
      </FieldRow>
      <FieldRow>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="name@company.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" required placeholder="(555) 010-2030" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
      </FieldRow>
      <div>
        <Label htmlFor="reason">Reason for Contacting</Label>
        <Textarea id="reason" required rows={4} placeholder="How can we help?" value={form.reason} onChange={(e) => update("reason", e.target.value)} />
      </div>
      <Button type="submit" size="lg" shimmer disabled={loading} className="pr-5">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send Message <ArrowOrb />
      </Button>
    </form>
  );
}
