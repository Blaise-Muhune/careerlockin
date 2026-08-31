import "server-only";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logError } from "@/lib/server/logging";
import {
  decideStripeEventClaim,
  isCheckoutSessionPaid,
} from "@/lib/server/stripe/webhook-utils";

export { decideStripeEventClaim, isCheckoutSessionPaid };

const PRODUCT_KEY_ROADMAP_UNLOCK = "roadmap_unlock";

export type ServiceClient = ReturnType<typeof createServiceRoleClient>;

export function getUserIdFromSession(
  session: Stripe.Checkout.Session
): string | null {
  const ref = session.client_reference_id;
  const meta = session.metadata?.user_id;
  return (meta ?? ref) as string | null;
}

export function periodEndIsoFromSubscription(
  sub: Stripe.Subscription
): string | null {
  const firstItem = sub.items.data[0];
  const periodEnd = firstItem?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

export function cancelAtPeriodEndIso(sub: Stripe.Subscription): string | null {
  const periodEndIso = periodEndIsoFromSubscription(sub);
  const isActive = sub.status === "active" || sub.status === "trialing";
  if (sub.cancel_at_period_end && periodEndIso && isActive) {
    return periodEndIso;
  }
  return null;
}

export async function resolveUserIdForSubscription(
  supabase: ServiceClient,
  sub: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = sub.metadata?.user_id;
  if (fromMeta) return fromMeta;

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) return null;

  const { data: bySub } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  if (bySub?.user_id) return bySub.user_id;

  const { data: byCustomer } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (byCustomer?.user_id) return byCustomer.user_id;

  const { data: purchase } = await supabase
    .from("purchases")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .limit(1)
    .maybeSingle();
  return purchase?.user_id ?? null;
}

export async function upsertSubscriptionFromStripe(
  supabase: ServiceClient,
  sub: Stripe.Subscription,
  userId: string
): Promise<void> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) {
    throw new Error("Subscription missing customer.");
  }

  const firstItem = sub.items.data[0];
  const priceId = firstItem?.price.id ?? null;

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: priceId,
      current_period_end: periodEndIsoFromSubscription(sub),
      cancel_at_period_end: cancelAtPeriodEndIso(sub),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) {
    throw new Error(`subscriptions upsert: ${error.message}`);
  }
}

/**
 * Claim the event for processing. Returns:
 * - "already_processed" → acknowledge with 200
 * - "claimed" → run handler, then markProcessed
 */
export async function claimStripeEvent(
  supabase: ServiceClient,
  event: Pick<Stripe.Event, "id" | "type">
): Promise<"already_processed" | "claimed"> {
  const { data: existing } = await supabase
    .from("stripe_events")
    .select("event_id, processed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  const decision = decideStripeEventClaim(
    existing
      ? { processed_at: existing.processed_at as string | null }
      : null
  );
  if (decision === "already_processed") {
    return "already_processed";
  }

  if (!existing) {
    const { error: insertErr } = await supabase.from("stripe_events").insert({
      event_id: event.id,
      event_type: event.type,
      processed_at: null,
    });
    if (insertErr) {
      if (insertErr.code === "23505") {
        const { data: raced } = await supabase
          .from("stripe_events")
          .select("processed_at")
          .eq("event_id", event.id)
          .maybeSingle();
        return decideStripeEventClaim(
          raced
            ? { processed_at: raced.processed_at as string | null }
            : null
        );
      }
      throw new Error(`stripe_events insert: ${insertErr.message}`);
    }
  }

  return "claimed";
}

export async function markStripeEventProcessed(
  supabase: ServiceClient,
  eventId: string
): Promise<void> {
  const { error } = await supabase
    .from("stripe_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("event_id", eventId);
  if (error) {
    throw new Error(`stripe_events mark processed: ${error.message}`);
  }
}

export async function handleStripeEvent(
  supabase: ServiceClient,
  stripe: Stripe,
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = getUserIdFromSession(session);
      if (!userId) {
        void logError("stripe-webhook", new Error("Missing user_id in session"), {
          eventType: event.type,
          eventId: event.id,
        });
        return;
      }

      if (!isCheckoutSessionPaid(session.payment_status)) {
        void logError(
          "stripe-webhook",
          new Error(`Checkout not paid: ${session.payment_status}`),
          { eventType: event.type, eventId: event.id }
        );
        return;
      }

      if (session.mode === "payment") {
        const paymentIntentId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        const { error } = await supabase.from("purchases").upsert(
          {
            user_id: userId,
            product_key: PRODUCT_KEY_ROADMAP_UNLOCK,
            stripe_customer_id: customerId,
            stripe_payment_intent_id: paymentIntentId,
            status: "paid",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,product_key" }
        );
        if (error) {
          throw new Error(`purchases upsert: ${error.message}`);
        }
      }

      if (session.mode === "subscription" && session.subscription) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        await upsertSubscriptionFromStripe(supabase, sub, userId);
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdForSubscription(supabase, sub);
      if (!userId) {
        void logError(
          "stripe-webhook",
          new Error("Could not resolve user_id for subscription event"),
          { eventType: event.type, eventId: event.id, subscriptionId: sub.id }
        );
        return;
      }
      await upsertSubscriptionFromStripe(supabase, sub, userId);
      break;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subId =
        typeof subRef === "string" ? subRef : subRef?.id ?? null;
      if (!subId) break;

      const sub = await stripe.subscriptions.retrieve(subId);
      const userId = await resolveUserIdForSubscription(supabase, sub);
      if (!userId) {
        void logError(
          "stripe-webhook",
          new Error("Could not resolve user_id for invoice event"),
          { eventType: event.type, eventId: event.id }
        );
        return;
      }
      await upsertSubscriptionFromStripe(supabase, sub, userId);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;
      if (!paymentIntentId) break;

      const { error } = await supabase
        .from("purchases")
        .update({ status: "refunded", updated_at: new Date().toISOString() })
        .eq("stripe_payment_intent_id", paymentIntentId);
      if (error) {
        throw new Error(`purchases refund update: ${error.message}`);
      }
      break;
    }

    default:
      break;
  }
}
