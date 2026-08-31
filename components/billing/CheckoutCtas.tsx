"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRoadmapUnlockCheckout } from "@/app/actions/createRoadmapUnlockCheckout";
import { createProSubscriptionCheckout } from "@/app/actions/createProSubscriptionCheckout";

type CheckoutCtasProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  unlockLabel?: string;
  proLabel?: string;
  unlockVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  proVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  buttonClassName?: string;
};

/**
 * Starts Stripe Checkout immediately (Unlock one-time or Pro subscription).
 */
export function CheckoutCtas({
  className,
  size = "sm",
  unlockLabel = "Unlock roadmap access",
  proLabel = "Upgrade to Pro",
  unlockVariant = "secondary",
  proVariant = "default",
  buttonClassName,
}: CheckoutCtasProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"unlock" | "pro" | null>(null);

  async function handleUnlock() {
    setError(null);
    setPending("unlock");
    const out = await createRoadmapUnlockCheckout();
    setPending(null);
    if (out.ok) {
      window.location.href = out.url;
      return;
    }
    setError(out.error);
  }

  async function handlePro() {
    setError(null);
    setPending("pro");
    const out = await createProSubscriptionCheckout();
    setPending(null);
    if (out.ok) {
      window.location.href = out.url;
      return;
    }
    setError(out.error);
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={unlockVariant}
          size={size}
          className={buttonClassName}
          disabled={!!pending}
          onClick={handleUnlock}
        >
          {pending === "unlock" ? "Redirecting…" : unlockLabel}
        </Button>
        <Button
          type="button"
          variant={proVariant}
          size={size}
          className={buttonClassName}
          disabled={!!pending}
          onClick={handlePro}
        >
          {pending === "pro" ? "Redirecting…" : proLabel}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
