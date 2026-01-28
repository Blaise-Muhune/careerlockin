# Deploy notes: Vercel

Guide to deploying CareerLockin on Vercel with Supabase, Stripe, optional Resend, and Sentry.

## Required environment variables

### Public (exposed to client; no secrets)

| Name | Purpose |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (auth + DB) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (client + server) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js / Checkout (client) |
| `NEXT_PUBLIC_APP_URL` | Base URL for redirects and links (e.g. `https://yourapp.vercel.app`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical/SEO URL (optional; falls back to `NEXT_PUBLIC_APP_URL`) |

At least one of `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_APP_URL` must be set. For production, set both to your production domain (e.g. `https://careerlockin.com`).

### Server-only (never expose to client)

| Name | Purpose |
|------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key (webhooks, jobs, admin) |
| `STRIPE_SECRET_KEY` | Stripe API key (server) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `ROADMAP_UNLOCK_PRICE_ID` | Stripe Price ID for one-time unlock |
| `PRO_SUBSCRIPTION_PRICE_ID` | Stripe Price ID for Pro subscription |
| `OPENAI_API_KEY` | OpenAI API key for roadmap generation |

### Optional

| Name | Purpose |
|------|---------|
| `RESEND_API_KEY` | Resend API key for emails |
| `EMAIL_FROM_ADDRESS` | From address (e.g. `CareerLockin <noreply@careerlockin.com>`) |
| `CRON_SECRET` | Secret for protecting cron routes (e.g. Vercel Cron) |
| `ADMIN_PRO_MONTHLY_CENTS` | Cents per Pro sub per month for MRR (e.g. `999`) |
| `GOOGLE_SITE_VERIFICATION` | Google Search Console verification |
| `BING_SITE_VERIFICATION` | Bing verification |
| `NEXT_PUBLIC_TWITTER_HANDLE` | Twitter handle for OG/Twitter cards |

### Sentry (optional)

Package: `@sentry/nextjs` (see package.json). Used for server, client, and edge error monitoring when DSN is set.

| Name | Purpose |
|------|---------|
| `SENTRY_DSN` | Sentry DSN (server/edge; set for error monitoring) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for client (use same value as `SENTRY_DSN` if you want client errors) |
| `SENTRY_AUTH_TOKEN` | Auth token for source map uploads (CI only; not required at runtime) |
| `SENTRY_ORG` | Sentry org slug (for source maps) |
| `SENTRY_PROJECT` | Sentry project slug (for source maps) |

---

## Supabase URL and keys

1. In [Supabase](https://supabase.com) → your project → **Settings** → **API**:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only; never in client)

2. Ensure all migrations have been run on the production DB (e.g. `supabase db push` or run migration SQL in the SQL Editor).

3. In Vercel, add these under **Project** → **Settings** → **Environment Variables**. For production, set them for the **Production** environment.

---

## Stripe webhook setup

1. In [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks** → **Add endpoint**.

2. **Endpoint URL**:  
   `https://<your-production-domain>/api/stripe/webhook`  
   (e.g. `https://careerlockin.com/api/stripe/webhook` or `https://yourapp.vercel.app/api/stripe/webhook`).

3. **Events to send** (recommended):
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `charge.refunded`

4. After creating the endpoint, open it and reveal the **Signing secret** (`whsec_...`). Copy it into `STRIPE_WEBHOOK_SECRET` in Vercel.

5. Use the same Stripe **publishable** and **secret** keys (and Price IDs) that match the mode (test vs live) you use in production.

---

## Sentry DSN setup

1. Create a project at [sentry.io](https://sentry.io) for your Next.js app.

2. In the project settings, copy the **DSN**.

3. In Vercel:
   - `SENTRY_DSN` = that DSN (server/edge).
   - `NEXT_PUBLIC_SENTRY_DSN` = same DSN (client errors).
   - For source maps: set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in Vercel (e.g. for Production) or in CI; they are not required at runtime.

4. Deploy and trigger a test error; confirm it appears in Sentry.

---

## Post-deploy smoke test order

1. **Health** – `GET https://<your-domain>/api/status` returns `{ ok: true, ... }` and `supabaseConfigured: true`.
2. **Public pages** – Open `/`, `/blog`, `/legal`; check one blog post.
3. **Auth** – Sign up, log in, log out.
4. **Onboarding** – Complete onboarding; confirm profile and next step.
5. **Roadmap** – Generate a roadmap; open it and confirm steps.
6. **Billing** – Run one test checkout (unlock or subscription); confirm webhook and entitlements in app and Stripe.
7. **Cron (if used)** – Hit a cron route with `CRON_SECRET` and confirm expected response.

See **Launch QA** ([docs/launch-qa.md](./launch-qa.md)) for the full step-by-step checklist.
