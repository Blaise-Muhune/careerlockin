# Billing (Stripe)

Hybrid model: one-time **Roadmap Unlock** (PLAN) and monthly **Pro** subscription (COACH).

## User states

- **Free**: Phase 1 visible; phases 2+ locked. Step tracking allowed only for Phase 1. No time logs, no charts. 1 regeneration per roadmap.
- **Plan Unlocked**: One-time purchase. Full roadmap (all phases, steps, resources) **and step tracking in every phase**. Time logs and charts still Pro-only. 1 regeneration per roadmap.
- **Pro**: Subscription. Full roadmap + step tracking + time logs in all phases + charts and insights. Up to 5 roadmaps. **3 regenerations** per roadmap.

Pro takes priority over Plan Unlocked. Time logs beyond Phase 1 and charts require Pro.

## Env vars

| Name | Purpose |
|------|---------|
| `STRIPE_SECRET_KEY` | Server-side Stripe API key (never in client) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side key for Stripe.js if needed |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `ROADMAP_UNLOCK_PRICE_ID` | One-time price id for roadmap unlock |
| `PRO_SUBSCRIPTION_PRICE_ID` | Recurring price id for Pro (monthly) |
| `NEXT_PUBLIC_APP_URL` | Base URL for Stripe success/cancel/return (e.g. `https://yourapp.com`) |

## Creating products & prices in Stripe

1. **Roadmap Unlock (one-time)**  
   - In Stripe Dashboard: Products → Add product.  
   - Name: e.g. "Roadmap Unlock".  
   - Add a price: one-time, your desired amount.  
   - Copy the **Price ID** (e.g. `price_xxx`) into `ROADMAP_UNLOCK_PRICE_ID`.

2. **Pro (subscription)**  
   - Add product e.g. "Pro".  
   - Add a price: recurring, monthly.  
   - Copy the **Price ID** into `PRO_SUBSCRIPTION_PRICE_ID`.

3. **Webhook**  
   - Developers → Webhooks → Add endpoint.  
   - URL: `https://your-domain.com/api/stripe/webhook`.  
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`.  
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

## Webhook events

| Event | Action |
|-------|--------|
| `checkout.session.completed` (mode `payment`, paid) | Upsert `purchases` for `roadmap_unlock`, status `paid`. |
| `checkout.session.completed` (mode `subscription`, paid) | Upsert `subscriptions` with customer/subscription ids, status, `current_period_end`. |
| `customer.subscription.created` / `updated` / `deleted` | Upsert `subscriptions` by user (metadata or customer lookup). |
| `invoice.paid` / `invoice.payment_failed` | Re-sync subscription status from Stripe. |
| `charge.refunded` | Set `purchases.status = 'refunded'` where `stripe_payment_intent_id` matches. |

Idempotency: events are claimed in `stripe_events` with `processed_at` set **only after** successful handling. Failed handlers return 500 so Stripe retries; duplicates with `processed_at` set are no-ops.

User is identified via `client_reference_id` and `metadata.user_id` on the Checkout Session. Entitlements are updated only from webhook writes (service-role DB); never from client callbacks.

## Entitlement rules

- **hasRoadmapUnlock**: at least one `purchases` row with `product_key = 'roadmap_unlock'` and `status = 'paid'`.
- **isPro**: at least one `subscriptions` row with `status` in `active` or `trialing`.
- **canViewFullRoadmap** = `hasRoadmapUnlock || isPro`. If false, only Phase 1 is fully visible; other phases show titles but content is locked.
- **canTrackAllPhases** = `hasRoadmapUnlock || isPro`. Step completion and current-work for phases 2+; Free is Phase 1 only.
- **canUseTracking** = `isPro`. Time logs beyond Phase 1 require Pro.
- **canSeeCharts** = `isPro`. Weekly trend and phase completion charts require Pro.
- **canGenerateExtraRoadmaps** = `isPro`. Free and one-time unlock: 1 roadmap; Pro: up to 5 roadmaps.
- **Regen limit**: Free/Unlock 1 per roadmap; Pro 3 per roadmap.

Canceled Pro: time logs and charts lock again. Full roadmap and step tracking remain if the user also has a `roadmap_unlock` purchase; otherwise phases beyond Phase 1 lock again.
