import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Entitlements = {
  hasRoadmapUnlock: boolean;
  isPro: boolean;
  canViewFullRoadmap: boolean;
  canUseTracking: boolean;
  canSeeCharts: boolean;
  canGenerateExtraRoadmaps: boolean;
};

const PRODUCT_KEY_ROADMAP_UNLOCK = "roadmap_unlock";
const PURCHASE_STATUS_PAID = "paid";
const SUB_STATUS_ACTIVE = "active";
const SUB_STATUS_TRIALING = "trialing";

/**
 * Single source of truth for billing entitlements.
 * Call with the server-resolved user id (e.g. from requireUser()).
 *
 * - canViewFullRoadmap = hasRoadmapUnlock OR isPro
 * - Tracking, charts, insights = Pro only
 * - canGenerateExtraRoadmaps = true only for Pro (unlimited); free and one-time unlock get 1 roadmap
 */
export async function getEntitlements(userId: string): Promise<Entitlements> {
  const supabase = await createClient();

  const [{ data: purchaseRows }, { data: subRows }] = await Promise.all([
    supabase
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("product_key", PRODUCT_KEY_ROADMAP_UNLOCK)
      .eq("status", PURCHASE_STATUS_PAID),
    supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .in("status", [SUB_STATUS_ACTIVE, SUB_STATUS_TRIALING]),
  ]);

  const hasRoadmapUnlock =
    Array.isArray(purchaseRows) && purchaseRows.length > 0;
  const isPro = Array.isArray(subRows) && subRows.length > 0;

  return {
    hasRoadmapUnlock,
    isPro,
    canViewFullRoadmap: hasRoadmapUnlock || isPro,
    canUseTracking: isPro,
    canSeeCharts: isPro,
    canGenerateExtraRoadmaps: isPro,
  };
}

export type SubscriptionDetails = {
  current_period_end: string | null;
  cancel_at_period_end: string | null;
};

/**
 * Returns subscription period and cancel state for settings display.
 * User keeps Pro access until current_period_end when cancel_at_period_end is set.
 */
export async function getSubscriptionDetails(
  userId: string
): Promise<SubscriptionDetails | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .in("status", [SUB_STATUS_ACTIVE, SUB_STATUS_TRIALING])
    .maybeSingle();

  if (!data) return null;

  return {
    current_period_end: data.current_period_end ?? null,
    cancel_at_period_end: data.cancel_at_period_end ?? null,
  };
}

const SUB_STATUS_CANCELED = "canceled";
const SUB_STATUS_PAST_DUE = "past_due";
const SUB_STATUS_UNPAID = "unpaid";

/**
 * Returns true when the user had a Pro subscription that has ended (canceled, past_due, unpaid).
 * Used on settings page to show "Pro ended" banner so they can resubscribe.
 */
export async function getProEndedForBanner(
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .in("status", [SUB_STATUS_CANCELED, SUB_STATUS_PAST_DUE, SUB_STATUS_UNPAID])
    .limit(1)
    .maybeSingle();

  return data != null;
}
