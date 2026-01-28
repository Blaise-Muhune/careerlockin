import "server-only";
import { getEnv } from "@/lib/server/env";

const ROADMAP_UNLOCK = "roadmap_unlock";
const PRO_SUBSCRIPTION = "pro_subscription";

export type PriceIds = {
  roadmapUnlock: string;
  proSubscription: string;
};

/**
 * Stripe price IDs from env. Used for checkout sessions and webhook idempotency.
 */
export function getPriceIds(): PriceIds {
  const { ROADMAP_UNLOCK_PRICE_ID: roadmapUnlock, PRO_SUBSCRIPTION_PRICE_ID: proSubscription } =
    getEnv();
  return { roadmapUnlock, proSubscription };
}

export { ROADMAP_UNLOCK as PRODUCT_KEY_ROADMAP_UNLOCK };
export { PRO_SUBSCRIPTION as PRODUCT_KEY_PRO_SUBSCRIPTION };
