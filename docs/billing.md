# Billing (Stripe)

Hybrid model: one-time **Roadmap Unlock** (PLAN) and monthly **Pro** subscription (COACH).

## User states

- **Free**: Phase 1 visible; phases 2+ locked. Tracking allowed only for Phase 1 (step completion, current work). No time logs, no charts.
- **Plan Unlocked**: One-time purchase. Full roadmap (all phases, steps, resources). Tracking allowed only for Phase 1. No time logs, no charts.
- **Pro**: Subscription. Full roadmap + tracking in all phases (steps, time logs, current work) + charts and insights. Unlimited roadmaps.

Pro takes priority over Plan Unlocked. Tracking beyond Phase 1 (and time logs/charts) requires Pro.

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
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`.  
   - Copy the **Signing secret** into `STRIPE_WEBHOOK_SECRET`.

## Webhook events

| Event | Action |
|-------|--------|
| `checkout.session.completed` (mode `payment`) | Upsert `purchases` for `roadmap_unlock`, status `paid`. |
| `checkout.session.completed` (mode `subscription`) | Upsert `subscriptions` with customer/subscription ids, status, `current_period_end`. |
| `customer.subscription.updated` | Update `subscriptions` row by `stripe_subscription_id`. |
| `customer.subscription.deleted` | Same as updated; status becomes canceled etc. |
| `charge.refunded` | Set `purchases.status = 'refunded'` where `stripe_payment_intent_id` matches. |

User is identified via `client_reference_id` and `metadata.user_id` on the Checkout Session. Entitlements are updated only from webhook writes (service-role DB); never from client callbacks.

## Entitlement rules

- **hasRoadmapUnlock**: at least one `purchases` row with `product_key = 'roadmap_unlock'` and `status = 'paid'`.
- **isPro**: at least one `subscriptions` row with `status` in `active` or `trialing`.
- **canViewFullRoadmap** = `hasRoadmapUnlock || isPro`. If false, only Phase 1 is fully visible; other phases show titles but content is locked.
- **canUseTracking** = `isPro`. Step completion and current-work are allowed for Phase 1 for all tiers; phases 2+ require Pro. Time logs require Pro (notes are per time log).
- **canSeeCharts** = `isPro`. Weekly trend and phase completion charts require Pro.
- **canGenerateExtraRoadmaps** = `isPro`. Free and one-time unlock: 1 roadmap; Pro: unlimited.

Canceled Pro: tracking and charts lock again. Full roadmap remains only if the user also has a `roadmap_unlock` purchase; otherwise phases beyond Phase 1 lock again.
