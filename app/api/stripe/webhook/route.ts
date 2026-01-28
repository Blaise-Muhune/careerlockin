import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/server/stripe/client";
import { getEnv } from "@/lib/server/env";
import { logError } from "@/lib/server/logging";

const PRODUCT_KEY_ROADMAP_UNLOCK = "roadmap_unlock";

function getUserIdFromSession(session: Stripe.Checkout.Session): string | null {
  const ref = session.client_reference_id;
  const meta = session.metadata?.user_id;
  return (meta ?? ref) as string | null;
}

export async function POST(request: Request) {
  const secret = getEnv().STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  const body = await request.text();
  const sig = (await headers()).get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { message: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ message: `Webhook Error: ${msg}` }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { error: insertErr } = await supabase.from("stripe_events").insert({
    event_id: event.id,
    event_type: event.type,
  });
  if (insertErr) {
    if (insertErr.code === "23505") {
      return NextResponse.json({ received: true }, { status: 200 });
    }
    throw new Error(`stripe_events insert: ${insertErr.message}`);
  }

  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = getUserIdFromSession(session);
        if (!userId) {
          void logError("stripe-webhook", new Error("Missing user_id in session"), {
            eventType: event.type,
            eventId: event.id,
          });
          return NextResponse.json({ received: true }, { status: 200 });
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
            {
              onConflict: "user_id,product_key",
            }
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
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;
          if (!customerId) {
            throw new Error("Subscription session missing customer.");
          }

          const sub = await stripe.subscriptions.retrieve(subId);
          const firstItem = sub.items.data[0];
          const priceId = firstItem?.price.id ?? null;
          const periodEnd = firstItem?.current_period_end;

          const { error } = await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: sub.id,
              status: sub.status,
              price_id: priceId,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" }
          );
          if (error) {
            throw new Error(`subscriptions upsert: ${error.message}`);
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const firstItem = sub.items.data[0];
        const priceId = firstItem?.price.id ?? null;
        const periodEnd = firstItem?.current_period_end;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: sub.status,
            price_id: priceId,
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);

        if (error) {
          throw new Error(`subscriptions update: ${error.message}`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string | null;
        if (!paymentIntentId) break;

        await supabase
          .from("purchases")
          .update({ status: "refunded", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntentId);
        break;
      }

      default:
        // acknowledge other events without acting
        break;
    }
  } catch (err) {
    void logError("stripe-webhook", err, {
      eventType: event.type,
      eventId: event.id,
    });
    const msg = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ message: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
