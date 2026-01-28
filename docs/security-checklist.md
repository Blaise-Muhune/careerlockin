# Supabase security checklist

Use this checklist before production to confirm RLS and service-role usage.

## RLS enabled for every user table

Verify each user-facing table has RLS enabled and policies that enforce ownership or join-through-ownership:

| Table | RLS | Policies enforce |
|-------|-----|------------------|
| **profiles** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **roadmaps** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **roadmap_steps** | ✓ | Access only via a roadmap owned by `auth.uid()` (join to `roadmaps`) |
| **resources** | ✓ | Access only via step → roadmap owned by `auth.uid()` |
| **progress** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **time_logs** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **weekly_checkins** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **current_work** | ✓ | `user_id = auth.uid()` for select/insert/update/delete |
| **purchases** | ✓ | `user_id = auth.uid()` for **select** only; inserts/updates via webhook (service role) |
| **subscriptions** | ✓ | `user_id = auth.uid()` for **select** only; inserts/updates via webhook (service role) |
| **stripe_events** | ✓ | No direct access (policy denies anon/auth); webhook uses service role |
| **email_milestone_sent** | ✓ | Used by jobs with service role only |
| **email_preferences** (on profiles) | ✓ | Via profiles RLS |

## Service role key

- **Never** use `SUPABASE_SERVICE_ROLE_KEY` in client components or any browser bundle.
- Use it only in server code: webhook handler, cron-triggered jobs, server actions that need to bypass RLS (e.g. admin), and Supabase `createServiceRoleClient()` in `lib/supabase/server.ts`.

## How to verify RLS in Supabase

### Option A: Supabase Dashboard

1. Open your project → **Table Editor** (or **SQL Editor**).
2. For each table above, open **Table** → **Policies** (or run the query below in SQL Editor).
3. Confirm RLS is enabled and policies match the intended ownership rules.

### Option B: SQL (run in SQL Editor)

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

`rowsecurity = true` means RLS is enabled. Then inspect policies:

```sql
select tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### Option C: Supabase CLI (if installed)

From the project root:

```bash
supabase db dump --schema public
```

Inspect the dump for `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `CREATE POLICY` statements.

## Checklist before launch

- [ ] Every user-owned table has RLS enabled.
- [ ] Policies enforce `user_id = auth.uid()` (or equivalent via owned parent, e.g. roadmap → steps/resources).
- [ ] `purchases` and `subscriptions` are read-only for users; writes only via webhook with service role.
- [ ] Service role key is not used in any client-side code or in env vars prefixed with `NEXT_PUBLIC_`.
