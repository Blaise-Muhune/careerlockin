import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the Stripe customer id for this user if one exists
 * (from subscription or a prior purchase). Used to reuse customer in checkout.
 */
export async function getStripeCustomerIdForUser(
  userId: string
): Promise<string | null> {
  const supabase = await createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const { data: purchase } = await supabase
    .from("purchases")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .not("stripe_customer_id", "is", null)
    .limit(1)
    .maybeSingle();

  return purchase?.stripe_customer_id ?? null;
}
