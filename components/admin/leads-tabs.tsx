"use client";

import { ExternalLink, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const TABS = [
  {
    value: "Offer_Applications",
    label: "Offer Applications",
    description: "Submissions from the Apply for Offer form on each offer's detail page.",
  },
  {
    value: "Publishers_Data",
    label: "Publishers",
    description: "Submissions from /apply-as-publisher.",
  },
  {
    value: "Buyers_Data",
    label: "Buyers",
    description: "Submissions from /for-buyers.",
  },
  {
    value: "Contact_Queries",
    label: "Contact",
    description: "Submissions from /contact.",
  },
];

export function LeadsTabs() {
  const sheetUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              Leads
            </h3>
            <p className="mt-1 text-sm text-muted">
              All 4 forms write directly to your connected Google Sheet — one
              tab per form. Open the sheet to view, filter, or export leads.
            </p>
          </div>
          {sheetUrl ? (
            <Button asChild size="sm" variant="outline">
              <a href={sheetUrl} target="_blank" rel="noreferrer">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Open Sheet <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </div>

        <Tabs defaultValue={TABS[0].value}>
          <TabsList className="max-w-full overflow-x-auto">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <div className="rounded-xl border border-border bg-surface p-6 text-sm">
                <p className="text-foreground">{tab.description}</p>
                <p className="mt-2 text-muted">
                  Sheet tab name: <code className="text-gold">{tab.value}</code>
                </p>
                {!sheetUrl && (
                  <p className="mt-3 text-xs text-muted">
                    Set <code className="text-gold">NEXT_PUBLIC_GOOGLE_SHEET_URL</code> in
                    your environment to show a direct &quot;Open Sheet&quot; link here.
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
