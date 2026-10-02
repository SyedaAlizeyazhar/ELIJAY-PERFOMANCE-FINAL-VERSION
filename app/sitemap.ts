import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Public pages only — publisher and admin areas stay out.
const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/for-buyers", priority: 0.9 },
  { path: "/apply-as-publisher", priority: 0.9 },
  { path: "/offers", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `${SITE.url}${p.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: p.priority,
  }));
}
