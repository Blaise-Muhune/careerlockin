import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/server/stripe/client";
import { getEnv } from "@/lib/server/env";
import { logError } from "@/lib/server/logging";
import {
  claimStripeEvent,
  handleStripeEvent,
  markStripeEventProcessed,
} from "@/lib/server/stripe/webhook-handlers";

export async function POST(request: Request) {
  const secret = getEnv().STRIPE_WEBHOOK_SECRET;

  let event;
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
  const stripe = getStripe();

  try {
    const claim = await claimStripeEvent(supabase, event);
    if (claim === "already_processed") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    await handleStripeEvent(supabase, stripe, event);
    await markStripeEventProcessed(supabase, event.id);
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
