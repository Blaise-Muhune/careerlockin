"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LockBanner() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
      <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">
        Phase 1 visible. Unlock full roadmap (one-time) or upgrade to Pro for tracking and insights.
      </span>
      <div className="flex flex-wrap gap-2 ml-auto">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/settings">Unlock full roadmap</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/settings">Upgrade to Pro</Link>
        </Button>
      </div>
    </div>
  );
}
