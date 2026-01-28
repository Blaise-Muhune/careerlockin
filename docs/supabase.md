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
2. Run the contents of each migration file in order:
   - `supabase/migrations/00001_initial_schema.sql`
   - `supabase/migrations/00002_rls_policies.sql`
   - `supabase/migrations/00003_time_logs.sql` (if present)
   - `supabase/migrations/00004_current_work.sql` (if present)
   - `supabase/migrations/00005_profiles_personalization.sql` (if present) — adds `goal_intent`, `target_timeline_weeks`, `prior_exposure`, `learning_preference` to profiles.

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

All policies are defined in `supabase/migrations/00002_rls_policies.sql`. No table is readable or writable without a matching policy.

## Troubleshooting

### "Could not find the table 'public.profiles' in the schema cache"

This means the migrations have not been applied to your Supabase project. Apply them as follows:

1. Open **[Supabase Dashboard](https://supabase.com/dashboard) → your project → SQL Editor**.
2. Run **`supabase/migrations/00001_initial_schema.sql`** first (copy its full contents, paste, Run).
3. Then run **`supabase/migrations/00002_rls_policies.sql`** (copy its full contents, paste, Run).

After both run without errors, the `profiles` table and the rest of the schema exist and the app can query them.
