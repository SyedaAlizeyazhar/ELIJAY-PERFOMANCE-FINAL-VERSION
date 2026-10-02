"use client";

import { useRouter } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VerticalsManager } from "@/components/admin/verticals-manager";
import { OffersManager } from "@/components/admin/offers-manager";
import { LeadsTabs } from "@/components/admin/leads-tabs";

export function DashboardShell() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin-elite-elijah-2024");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface/60">
        <div className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-gradient">
              <Zap className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">
                Admin Dashboard
              </p>
              <p className="text-xs text-muted">ELIJAY Performance Partners</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={logout}>
            <LogOut className="h-3.5 w-3.5" /> Log Out
          </Button>
        </div>
      </div>

      <div className="container py-10">
        <Tabs defaultValue="offers">
          <TabsList className="max-w-full overflow-x-auto">
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="verticals">Verticals</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>

          <TabsContent value="offers">
            <OffersManager />
          </TabsContent>

          <TabsContent value="verticals">
            <VerticalsManager />
          </TabsContent>

          <TabsContent value="leads">
            <LeadsTabs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
