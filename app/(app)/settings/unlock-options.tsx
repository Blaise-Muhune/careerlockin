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
};

export function UnlockOptions({ entitlements }: UnlockOptionsProps) {
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
  const showPro = !entitlements.isPro;
  const showManageBilling = entitlements.isPro;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Unlock options</h2>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {showUnlockPlan && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unlock full roadmap</CardTitle>
              <CardDescription>
                One-time purchase. See all phases, steps, and resources.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleUnlock}
                disabled={!!pending}
              >
                {pending === "unlock" ? "Redirecting…" : "Unlock full roadmap"}
              </Button>
            </CardContent>
          </Card>
        )}
        {showPro && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Upgrade to Pro</CardTitle>
              <CardDescription>
                {showUnlockPlan
                  ? "Subscription includes full roadmap plus tracking, charts, and insights."
                  : "Unlock tracking, time logs, charts, and insights."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="sm"
                onClick={handlePro}
                disabled={!!pending}
              >
                {pending === "pro" ? "Redirecting…" : "Upgrade to Pro"}
              </Button>
            </CardContent>
          </Card>
        )}
        {showManageBilling && (
          <Card className="sm:col-span-2">
            <CardContent className="flex flex-col gap-2 pt-6">
              <p className="text-sm text-muted-foreground">
                Manage your subscription and invoices.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={handlePortal}
                disabled={!!pending}
              >
                {pending === "portal" ? "Redirecting…" : "Manage billing"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
