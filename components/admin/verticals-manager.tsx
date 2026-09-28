"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vertical } from "@/lib/types";

export function VerticalsManager() {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  async function load() {
    setFetching(true);
    try {
      const res = await fetch("/api/admin/verticals");
      const data = await res.json();
      setVerticals(data.verticals ?? []);
    } catch {
      toast.error("Failed to load verticals.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addVertical(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/verticals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVerticals(data.verticals ?? []);
      setName("");
      toast.success("Vertical added.");
    } catch {
      toast.error("Failed to add vertical.");
    } finally {
      setLoading(false);
    }
  }

  async function removeVertical(id: string) {
    try {
      const res = await fetch(`/api/admin/verticals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVerticals(data.verticals ?? []);
      toast.success("Vertical removed.");
    } catch {
      toast.error("Failed to remove vertical.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Verticals</CardTitle>
        <CardDescription>
          These power the dropdowns on the offer form and publisher application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={addVertical} className="flex gap-3">
          <Input
            placeholder="e.g. Medicare, ACA, Final Expense"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" disabled={loading} size="default">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          {fetching ? (
            <p className="text-sm text-muted">Loading verticals…</p>
          ) : verticals.length === 0 ? (
            <p className="text-sm text-muted">No verticals yet — add your first one above.</p>
          ) : (
            verticals.map((v) => (
              <Badge key={v.id} className="gap-2 py-1.5 pl-3 pr-1.5">
                {v.name}
                <button
                  onClick={() => removeVertical(v.id)}
                  className="rounded-full p-1 text-muted hover:bg-danger/20 hover:text-danger"
                  aria-label={`Remove ${v.name}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
