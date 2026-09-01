"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createRoadmapUnlockCheckout } from "@/app/actions/createRoadmapUnlockCheckout";
import { createProSubscriptionCheckout } from "@/app/actions/createProSubscriptionCheckout";
import { createBillingPortal } from "@/app/actions/createBillingPortal";
import type { Entitlements } from "@/lib/server/billing/entitlements";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { appMonoStatClass, appPrimaryButtonClass, appSectionLabelClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type UnlockOptionsProps = {
  entitlements: Entitlements;
  cancelAtPeriodEnd?: boolean;
  /** Render beside the access summary on settings (no separate section). */
  embedded?: boolean;
};

export function UnlockOptions({
  entitlements,
  cancelAtPeriodEnd = false,
  embedded = false,
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
  const hasActions = showUnlockPlan || showPro || showManageBilling;

  return (
    <div
      id={embedded ? undefined : "unlock-options"}
      className={cn("space-y-4", embedded && "h-full")}
      aria-label="Unlock options"
    >
      {error ? (
        <p
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {!embedded ? (
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Roadmap Unlock</span> opens every
          phase with step tracking.{" "}
          <span className="font-semibold text-foreground">Pro</span> adds time logs, charts,
          insights, and multiple roadmaps.
        </p>
      ) : null}
      {embedded && hasActions ? (
        <p className={appSectionLabelClass}>Upgrade</p>
      ) : null}
      <div className={cn("grid gap-4", embedded ? "grid-cols-1" : "sm:grid-cols-2")}>
        {showUnlockPlan ? (
          <SettingsCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">Roadmap Unlock</CardTitle>
              <CardDescription>
                One-time purchase. See and check off all phases, steps, and resources.
              </CardDescription>
              <p className={cn("text-2xl font-bold text-foreground pt-2", appMonoStatClass)}>
                $29.99
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleUnlock}
                disabled={!!pending}
              >
                {pending === "unlock" ? "Redirecting…" : "Unlock roadmap access"}
              </Button>
            </CardContent>
          </SettingsCard>
        ) : null}
        {showPro ? (
          <SettingsCard className="border-primary/20 bg-primary/[0.03]">
            <CardHeader className="pb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {cancelAtPeriodEnd ? "Resubscribe" : "Recommended"}
              </p>
              <CardTitle className="text-lg font-bold">
                {cancelAtPeriodEnd ? "Resubscribe to Pro" : "Upgrade to Pro"}
              </CardTitle>
              <CardDescription>
                {cancelAtPeriodEnd
                  ? "Keep tracking and insights before your period ends."
                  : showUnlockPlan
                    ? "Full roadmap plus time logs, charts, recap emails, and up to five roadmaps."
                    : "Unlock time logs, charts, and insights."}
              </CardDescription>
              <p className={cn("text-2xl font-bold text-foreground pt-2", appMonoStatClass)}>
                $9.99
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                className={cn("w-full sm:w-auto", appPrimaryButtonClass)}
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
          </SettingsCard>
        ) : null}
        {showManageBilling ? (
          <SettingsCard className={embedded ? undefined : "sm:col-span-2"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Manage billing</CardTitle>
              <CardDescription>
                Update payment methods, view invoices, or cancel Pro. You keep Pro until the
                end of the current billing period.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handlePortal}
                disabled={!!pending}
              >
                {pending === "portal" ? "Redirecting…" : "Manage billing / cancel"}
              </Button>
            </CardContent>
          </SettingsCard>
        ) : null}
      </div>
    </div>
  );
}
