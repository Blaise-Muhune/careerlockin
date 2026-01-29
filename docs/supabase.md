# Supabase Setup

## Required environment variables

Set these in `.env.local` (use `.env.example` as a template):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (client + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client and server Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for admin/bypass operations; never expose to the client |

Copy `.env.example` to `.env.local` and fill in values from [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/_/settings/api).

## Running / applying migrations

Migrations live in `supabase/migrations/` and are applied to your Supabase project’s Postgres database.

### Option 1: Supabase CLI (recommended)

```bash
# Link to your project (if not already)
supabase link --project-ref <your-project-ref>

# Apply all pending migrations
supabase db push
```

### Option 2: SQL Editor (manual)

1. Open [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Run the contents of each migration file **in order**:

| Order | File | What it does |
|-------|------|--------------|
| 1 | `00001_initial_schema.sql` | profiles, roadmaps, roadmap_steps, resources, progress, weekly_checkins |
| 2 | `00002_rls_policies.sql` | RLS for the above tables |
| 3 | `00003_time_logs.sql` | time_logs table |
| 4 | `00004_current_work.sql` | current_work table |
| 5 | `00005_profiles_personalization.sql` | goal_intent, target_timeline_weeks, prior_exposure, learning_preference on profiles |
| 6 | `00006_purchases_subscriptions.sql` | purchases, subscriptions tables + RLS (required for billing) |
| 7 | `00007_email_preferences.sql` | email_* on profiles, email_milestone_sent table |
| 8 | `00008_admin_flag.sql` | is_admin on profiles |
| 9 | `00009_stripe_events.sql` | stripe_events table (webhook idempotency) |
| 10 | `00010_resources_source_verification.sql` | source_id, verification_status on resources |
| 11 | `00011_step_projects_practices.sql` | phase_project, practices (jsonb) on roadmap_steps |
| 12 | `00012_networking_support.sql` | linkedin_url, networking_* on profiles; networking_actions table |

If any migration is skipped, the app may throw "could not find the table" or missing column errors.

### Optional seed data

Run `supabase/seed.sql` manually in the SQL Editor if you add dev-only seed data.

## RLS overview

Row Level Security (RLS) is enabled on all user-facing tables. Policies enforce that users only see and change their own data.

| Table | Access rule |
|-------|-------------|
| **profiles** | `user_id = auth.uid()` — users manage only their own profile. |
| **roadmaps** | `user_id = auth.uid()` — users manage only their own roadmaps. |
| **roadmap_steps** | Access only when the step’s roadmap belongs to `auth.uid()` (via `roadmaps.user_id`). |
| **resources** | Access only when the resource’s step belongs to a roadmap owned by `auth.uid()`. |
| **progress** | `user_id = auth.uid()` — users manage only their own step completion. |
| **weekly_checkins** | `user_id = auth.uid()` — users manage only their own check-ins. |
| **purchases** | `user_id = auth.uid()` — select only; inserts/updates via Stripe webhook (service role). |
| **subscriptions** | `user_id = auth.uid()` — select only; inserts/updates via Stripe webhook (service role). |
| **time_logs** | `user_id = auth.uid()`. |
| **current_work** | `user_id = auth.uid()`. |
| **networking_actions** | `user_id = auth.uid()`. |

Policies for initial tables are in `00002_rls_policies.sql`; purchases/subscriptions RLS is in `00006`; networking in `00012`.

## Troubleshooting

### "Could not find the table 'public.profiles' in the schema cache"

This means the migrations have not been applied to your Supabase project. Apply them as follows:

1. Open **[Supabase Dashboard](https://supabase.com/dashboard) → your project → SQL Editor**.
2. Run **`supabase/migrations/00001_initial_schema.sql`** first (copy its full contents, paste, Run).
3. Then run **`supabase/migrations/00002_rls_policies.sql`** (copy its full contents, paste, Run).

After both run without errors, the `profiles` table and the rest of the schema exist and the app can query them.

### After subscribing, banner / locked content still shows

Entitlements (Pro, full roadmap, charts) come from `purchases` and `subscriptions`. The app revalidates and refreshes when you land with `?pro=success` or `?unlock=success`. If the Stripe webhook is slow, the DB row may not exist yet on first load.

1. **Ensure migrations 00006 and 00009 are applied** so `subscriptions` and `stripe_events` exist.
2. **Refresh the page** or wait a few seconds — the success page retries revalidation after 2.5s.
3. In Supabase SQL Editor, check that a row exists:  
   `select * from subscriptions where user_id = '<your-user-uuid>';`  
   Status should be `active` or `trialing` for Pro. Entitlements are computed in `lib/server/billing/entitlements.ts` from `subscriptions` (status in `active`/`trialing`) and `purchases` (product_key `roadmap_unlock`, status `paid`).
