"use server";

import { requireUser } from "@/lib/server/auth";
import { getStripeCustomerIdForUser } from "@/lib/server/billing/stripe-customer";
import { getStripe } from "@/lib/server/stripe/client";
import { getBaseUrl } from "@/lib/server/env";

export type CreateBillingPortalResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/**
 * Creates a Stripe Customer Billing Portal session for subscription management
 * and invoices. Requires an existing Stripe customer (Pro or prior purchase).
 */
export async function createBillingPortal(): Promise<CreateBillingPortalResult> {
  const user = await requireUser();
  const baseUrl = getBaseUrl();

  const customerId = await getStripeCustomerIdForUser(user.id);
  if (!customerId) {
    return {
      ok: false,
      error: "No billing account found. Subscribe or make a purchase first.",
    };
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${baseUrl}/settings`,
  });

  const url = session.url;
  if (!url) {
    return { ok: false, error: "Failed to create billing portal session." };
  }
  return { ok: true, url };
}
