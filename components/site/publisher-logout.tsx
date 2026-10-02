"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublisherLogout({ username }: { username: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/publisher/logout", { method: "POST" }).catch(() => null);
    router.replace("/publisher-login");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
      <span>
        Logged in as <span className="font-medium text-gold">{username}</span>
      </span>
      <Button size="sm" variant="subtle" onClick={logout}>
        <LogOut className="h-3.5 w-3.5" /> Log out
      </Button>
    </div>
  );
}
