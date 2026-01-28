"use client";

import { useEffect } from "react";
import { revalidateAfterPurchase } from "@/app/actions/revalidateAfterPurchase";

type PurchaseSuccessRevalidateProps = {
  shouldRevalidate: boolean;
};

/**
 * When the user lands with ?unlock=success or ?pro=success, revalidate in an effect
 * so it doesn't run during render (Next disallows revalidatePath during render).
 */
export function PurchaseSuccessRevalidate({
  shouldRevalidate,
}: PurchaseSuccessRevalidateProps) {
  useEffect(() => {
    if (shouldRevalidate) {
      revalidateAfterPurchase();
    }
  }, [shouldRevalidate]);
  return null;
}
