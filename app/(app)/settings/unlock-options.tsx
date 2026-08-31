"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createRoadmapUnlockCheckout } from "@/app/actions/createRoadmapUnlockCheckout";
import { createProSubscriptionCheckout } from "@/app/actions/createProSubscriptionCheckout";
import { createBillingPortal } from "@/app/actions/createBillingPortal";
import type { Entitlements } from "@/lib/server/billing/entitlements";

type UnlockOptionsProps = {
  entitlements: Entitlements;
  /** When true, user canceled Pro but still has access until period end; show Pro/Unlock again so they can resubscribe or one-time. */
  cancelAtPeriodEnd?: boolean;
};

export function UnlockOptions({
  entitlements,
  cancelAtPeriodEnd = false,
}: UnlockOptionsProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"unlock" | "pro" | "portal" | null>(null);

  async function handleUnlock() {
    setError(null);
    setPending("unlock");
    const out = await createRoadmapUnlockCheckout();
    setPending(null);
    if (out.ok) {
      window.location.href = out.url;
    } else {
      setError(out.error);
    }
  }

  async function handlePro() {
    setError(null);
    setPending("pro");
    const out = await createProSubscriptionCheckout();
    setPending(null);
    if (out.ok) {
      window.location.href = out.url;
    } else {
      setError(out.error);
    }
  }

  async function handlePortal() {
    setError(null);
    setPending("portal");
    const out = await createBillingPortal();
    setPending(null);
    if (out.ok) {
      window.location.href = out.url;
    } else {
      setError(out.error);
    }
  }

  const showUnlockPlan = !entitlements.canViewFullRoadmap;
  const showPro = !entitlements.isPro || cancelAtPeriodEnd;
  const showManageBilling = entitlements.isPro;

  return (
    <section id="unlock-options" className="space-y-4" aria-labelledby="unlock-options-heading">
      <h2 id="unlock-options-heading" className="text-sm font-medium text-foreground">Unlock options</h2>
      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Roadmap Unlock</span> gives
        full roadmap access and step tracking in every phase.
        <span className="ml-1 font-medium text-foreground">Pro</span> adds time
        logs, charts, insights, and multiple roadmaps.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {showUnlockPlan && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Roadmap Unlock</CardTitle>
              <CardDescription>
                One-time purchase. See and check off all phases, steps, and
                resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnlock}
                disabled={!!pending}
              >
                {pending === "unlock" ? "Redirecting…" : "Unlock roadmap access"}
              </Button>
            </CardContent>
          </Card>
        )}
        {showPro && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {cancelAtPeriodEnd ? "Resubscribe to Pro" : "Upgrade to Pro"}
              </CardTitle>
              <CardDescription>
                {cancelAtPeriodEnd
                  ? "Resubscribe before your period ends to keep tracking and insights."
                    : showUnlockPlan
                    ? "Subscription includes full roadmap, step tracking, time logs, charts, and insights."
                    : "Unlock time logs, charts, and insights."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                onClick={handlePro}
                disabled={!!pending}
              >
                {pending === "pro"
                  ? "Redirecting…"
                  : cancelAtPeriodEnd
                    ? "Resubscribe to Pro"
                    : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        )}
        {showManageBilling && (
          <Card className="sm:col-span-2">
            <CardContent className="flex flex-col gap-2 pt-6">
              <p className="text-sm text-muted-foreground">
                Manage payment methods, invoices, or cancel Pro. Cancellation is
                handled in the Stripe billing portal; you keep Pro until the end
                of the current period.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={handlePortal}
                disabled={!!pending}
              >
                {pending === "portal" ? "Redirecting…" : "Manage billing / cancel"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
