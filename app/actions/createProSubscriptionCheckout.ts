"use server";

import { requireUser } from "@/lib/server/auth";
import { getStripeCustomerIdForUser } from "@/lib/server/billing/stripe-customer";
import { getStripe } from "@/lib/server/stripe/client";
import { getPriceIds } from "@/lib/server/stripe/prices";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/server/env";

export type CreateProSubscriptionCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createProSubscriptionCheckout(): Promise<CreateProSubscriptionCheckoutResult> {
  const user = await requireUser();
  const baseUrl = getBaseUrl();

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  const email = authUser?.email ?? undefined;

  const customerId = await getStripeCustomerIdForUser(user.id);
  const { proSubscription } = getPriceIds();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    ...(customerId ? { customer: customerId } : { customer_email: email ?? undefined }),
    line_items: [{ price: proSubscription, quantity: 1 }],
    success_url: `${baseUrl}/settings?pro=success`,
    cancel_url: `${baseUrl}/settings`,
  });

  const url = session.url;
  if (!url) {
    return { ok: false, error: "Failed to create checkout session." };
  }
  return { ok: true, url };
}
