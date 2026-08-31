# CareerLockin

Personalized tech career roadmaps: Auth → Onboarding → AI roadmap (strict JSON) → Progress tracking → Stripe gates.

## Stack

- Next.js App Router + TypeScript
- Supabase (Auth, Postgres, RLS)
- Stripe (one-time unlock + Pro subscription)
- OpenAI (structured roadmap generation)
- Tailwind + shadcn/ui
- pnpm

## Local setup

1. Copy env and fill values (see [docs/deploy-vercel.md](docs/deploy-vercel.md)):

```bash
cp .env.example .env.local
```

2. Install and run:

```bash
pnpm install
pnpm dev
```

3. Apply Supabase migrations (`supabase/migrations/00001` … latest) to your project (`supabase db push` or SQL Editor).

4. Stripe: create Unlock + Pro prices, set Price IDs in env, forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Events to enable: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:roadmap` | Roadmap invariant script |

## Deploy checklist

- [ ] All migrations applied (including `is_admin` protection + `stripe_events.processed_at`)
- [ ] Env vars set in Vercel (required keys in `.env.example`)
- [ ] Supabase Auth redirect URLs allowlisted (`/auth/callback`)
- [ ] Stripe webhook endpoint + signing secret
- [ ] `CRON_SECRET` set for Vercel Cron routes
- [ ] `OPENAI_API_KEY` set in production (core feature)
- [ ] Optional: Resend, Sentry, `ROADMAP_GENERATION_DISABLED` kill switch

More: [docs/deploy-vercel.md](docs/deploy-vercel.md), [docs/billing.md](docs/billing.md), [docs/security-checklist.md](docs/security-checklist.md).
