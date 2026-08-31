"use client";

import { Lock } from "lucide-react";
import { CheckoutCtas } from "@/components/billing/CheckoutCtas";

export function LockBanner() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
      <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="text-muted-foreground">
        Free includes Phase 1. Get Roadmap Unlock (one-time) for all phases, or Pro for full access plus tracking and insights.
      </span>
      <CheckoutCtas className="ml-auto" />
    </div>
  );
}
