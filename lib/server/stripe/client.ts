import "server-only";
import Stripe from "stripe";
import { getEnv } from "@/lib/server/env";

let stripe: Stripe | null = null;

/**
 * Singleton Stripe client for server-side use only.
 * Uses STRIPE_SECRET_KEY from env.
 */
export function getStripe(): Stripe {
  const key = getEnv().STRIPE_SECRET_KEY;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}
