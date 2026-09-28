"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Pencil, X, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchedulePicker } from "@/components/admin/schedule-picker";
import { TrafficPicker } from "@/components/admin/traffic-picker";
import { OffersImport } from "@/components/admin/offers-import";
import { ResourceLinks } from "@/components/admin/resource-links";
import type { Offer, OfferStatus, Vertical } from "@/lib/types";

type FormState = Omit<Offer, "id" | "createdAt">;

const EMPTY: FormState = {
  title: "",
  vertical: "",
  payout: "",
  geo: "",
  cap: "",
  schedule: "",
  description: "",
  allowedTraffic: "",
  breakHours: "",
  resources: [],
  paymentTerms: "",
  status: "active",
};


export function OffersManager() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/offers");
      const data = await res.json();
      setOffers(data.offers ?? []);
    } catch {
      toast.error("Failed to load offers.");
    } finally {
      setFetching(false);
    }
  }

  async function loadVerticals() {
    try {
      const res = await fetch("/api/verticals");
      const data = await res.json();
      setVerticals(data.verticals ?? []);
    } catch {
      setVerticals([]);
    }
  }

  useEffect(() => {
    load();
    loadVerticals();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(offer: Offer) {
    setEditingId(offer.id);
    const { id, createdAt, ...rest } = offer;
    // Guard against offers created before the Payment Terms field existed.
    setForm({
      ...rest,
      paymentTerms: rest.paymentTerms || "",
      breakHours: rest.breakHours || "",
      // guard offers created before resources existed
      resources: rest.resources ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/admin/offers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOffers(data.offers ?? []);
        toast.success("Offer updated.");
      } else {
        const res = await fetch("/api/admin/offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOffers(data.offers ?? []);
        toast.success("Offer added to the live feed.");
      }
      cancelEdit();
    } catch {
      toast.error("Failed to save offer.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(offer: Offer) {
    const nextStatus: OfferStatus = offer.status === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOffers(data.offers ?? []);
    } catch {
      toast.error("Failed to update status.");
    }
  }

  async function removeOffer(id: string) {
    try {
      const res = await fetch(`/api/admin/offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOffers(data.offers ?? []);
      toast.success("Offer deleted.");
    } catch {
      toast.error("Failed to delete offer.");
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Campaign" : "Add New Campaign / Offer"}</CardTitle>
          <CardDescription>
            Published offers appear instantly on the public Offers page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="title">Offer Name</Label>
                <Input id="title" required value={form.title} onChange={(e) => update("title", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="vertical">Vertical</Label>
                <Select value={form.vertical} onValueChange={(v) => update("vertical", v)}>
                  <SelectTrigger id="vertical">
                    <SelectValue placeholder="Select a vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {verticals.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="payout">Payout</Label>
                <Input id="payout" required placeholder="$45/call" value={form.payout} onChange={(e) => update("payout", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="geo">Geo</Label>
                <Input id="geo" required placeholder="Nationwide, TX/FL" value={form.geo} onChange={(e) => update("geo", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="cap">Cap</Label>
                <Input id="cap" required placeholder="200/day" value={form.cap} onChange={(e) => update("cap", e.target.value)} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <SchedulePicker
                key={editingId ?? "new"}
                value={form.schedule}
                onChange={(next) => update("schedule", next)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <Label htmlFor="breakHours">Break Hours</Label>
                <Input
                  id="breakHours"
                  placeholder="e.g. 12PM-01PM EST, or None"
                  value={form.breakHours}
                  onChange={(e) => update("breakHours", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  required
                  placeholder="e.g. Net-15, Weekly, 50% upfront"
                  value={form.paymentTerms}
                  onChange={(e) => update("paymentTerms", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v as OfferStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" required rows={3} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-4">
              <ResourceLinks
                value={form.resources}
                onChange={(next) => update("resources", next)}
              />
            </div>

            <div>
              <TrafficPicker
                key={editingId ?? "new"}
                value={form.allowedTraffic}
                onChange={(next) => update("allowedTraffic", next)}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {editingId ? "Save Changes" : "Add Offer to Live Feed"}
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={cancelEdit}>
                  <X className="h-4 w-4" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <OffersImport onImported={load} />

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
          Current Offers
        </h3>
        {fetching ? (
          <p className="text-sm text-muted">Loading offers…</p>
        ) : offers.length === 0 ? (
          <p className="text-sm text-muted">No offers yet — add your first campaign above.</p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{offer.title}</p>
                      <Badge variant={offer.status === "active" ? "live" : "paused"}>
                        {offer.status === "active" ? "Active" : "Paused"}
                      </Badge>
                      <Badge variant="accent">{offer.vertical}</Badge>
                    </div>
                    <p className="text-sm text-muted">
                      {offer.payout} · Cap {offer.cap} · {offer.paymentTerms}
                      {offer.breakHours ? ` · Break ${offer.breakHours}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="subtle" onClick={() => toggleStatus(offer)}>
                      {offer.status === "active" ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                      {offer.status === "active" ? "Pause" : "Activate"}
                    </Button>
                    <Button size="sm" variant="subtle" onClick={() => startEdit(offer)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => removeOffer(offer.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
