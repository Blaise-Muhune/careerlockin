"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { revalidateAfterPurchase } from "@/app/actions/revalidateAfterPurchase";

type PurchaseSuccessRevalidateProps = {
  shouldRevalidate: boolean;
};

/**
 * When the user lands with ?unlock=success or ?pro=success, revalidate in an effect
 * so it doesn't run during render (Next disallows revalidatePath during render).
 * Calls router.refresh() so the current page refetches server data (entitlements).
 * Runs a delayed second pass so slow Stripe webhooks still update the UI.
 */
export function PurchaseSuccessRevalidate({
  shouldRevalidate,
}: PurchaseSuccessRevalidateProps) {
  const router = useRouter();

  useEffect(() => {
    if (!shouldRevalidate) return;

    let cancelled = false;

    async function run() {
      await revalidateAfterPurchase();
      if (!cancelled) router.refresh();
    }

    run();

    // Stripe webhook can be delayed; retry once so entitlements update
    const t = window.setTimeout(() => {
      if (cancelled) return;
      revalidateAfterPurchase().then(() => {
        if (!cancelled) router.refresh();
      });
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [shouldRevalidate, router]);

  return null;
}
