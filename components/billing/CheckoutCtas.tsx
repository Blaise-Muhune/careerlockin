"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createRoadmapUnlockCheckout } from "@/app/actions/createRoadmapUnlockCheckout";
import { createProSubscriptionCheckout } from "@/app/actions/createProSubscriptionCheckout";
import { appPrimaryButtonClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type CheckoutCtasProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  unlockLabel?: string;
  proLabel?: string;
  unlockVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  proVariant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  buttonClassName?: string;
};

export function CheckoutCtas({
  className,
  size = "sm",
  unlockLabel = "Unlock roadmap access",
  proLabel = "Upgrade to Pro",
  unlockVariant = "outline",
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

  const pillClass = cn("rounded-full min-h-9", buttonClassName);
  const proClass = cn(
    pillClass,
    proVariant === "default" && appPrimaryButtonClass
  );
  const unlockClass = cn(pillClass, unlockVariant === "outline" && "border-border/70");

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={unlockVariant}
          size={size}
          className={unlockClass}
          disabled={!!pending}
          onClick={handleUnlock}
        >
          {pending === "unlock" ? "Redirecting…" : unlockLabel}
        </Button>
        <Button
          type="button"
          variant={proVariant}
          size={size}
          className={proClass}
          disabled={!!pending}
          onClick={handlePro}
        >
          {pending === "pro" ? "Redirecting…" : proLabel}
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
