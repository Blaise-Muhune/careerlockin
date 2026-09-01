"use client";

import { Lock } from "lucide-react";
import { CheckoutCtas } from "@/components/billing/CheckoutCtas";
import { appSurfaceCardClass } from "@/lib/layout/app";

export function LockBanner() {
  return (
    <div
      className={`${appSurfaceCardClass} flex flex-wrap items-center gap-3 px-4 py-4 text-sm`}
    >
      <Lock className="size-4 shrink-0 text-primary" aria-hidden />
      <span className="text-muted-foreground flex-1 min-w-0 text-sm sm:text-base leading-relaxed">
        Free includes Phase 1. Get Roadmap Unlock (one-time) for all phases, or Pro
        for full access plus tracking and insights.
      </span>
      <CheckoutCtas className="shrink-0" />
    </div>
  );
}
