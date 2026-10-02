import type { Metadata } from "next";

// Kept out of search results without naming the path in robots.txt.
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
