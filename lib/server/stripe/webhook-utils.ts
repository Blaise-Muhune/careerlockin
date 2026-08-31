import type Stripe from "stripe";

/** Pure helper: whether a checkout session should grant entitlements. */
export function isCheckoutSessionPaid(
  paymentStatus: Stripe.Checkout.Session.PaymentStatus | null | undefined
): boolean {
  return paymentStatus === "paid" || paymentStatus === "no_payment_required";
}

/**
 * Decide claim outcome from existing row state (unit-testable).
 * - processed_at set → already_processed
 * - missing or unprocessed → claimed (caller inserts / reprocesses)
 */
export function decideStripeEventClaim(existing: {
  processed_at: string | null;
} | null): "already_processed" | "claimed" {
  if (existing?.processed_at) return "already_processed";
  return "claimed";
}
