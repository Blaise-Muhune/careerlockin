# Admin Dashboard

Internal, read-only admin dashboard for the founder to monitor product health, usage, and revenue. No user-level data, no impersonation, no editing.

## Who can access

- **Method:** Database flag only (`profiles.is_admin`).
- **Who:** Anyone with `profiles.is_admin = true`. Set via Supabase SQL or a script using the **service role**.
- **Non-admins:** Visiting `/admin` redirects to `/dashboard`. They never see admin data.

### Granting admin access safely

1. Use the Supabase dashboard or `psql` with the service-role (or a backend script using `SUPABASE_SERVICE_ROLE_KEY`).
2. Update only the intended user:

   ```sql
   update public.profiles
   set is_admin = true
   where user_id = '<auth-users-uuid>';
   ```

3. Do not expose `is_admin` in any user-facing UI or API. Only the admin layout checks it server-side.
4. Prefer a small, fixed set of admins (e.g. founder only). Revoke by setting `is_admin = false`.

## What the dashboard shows

All metrics are **aggregates only**. No emails, names, or identifiers.

### Users

- Total users (profiles).
- New users (last 7 days).
- Active users (last 7 days; defined as “logged at least one time log in last 7 days”).
- Bar chart: new users per week for the last 4 weeks (Monday–Sunday, America/Detroit).

### Roadmap usage

- Total roadmaps generated.
- Average roadmaps per user.
- % of users who unlocked the full roadmap (one-time unlock or Pro).
- % of users who are Pro (active or trialing subscription).

### Engagement

- Average hours logged per active user (last 7 days).
- Average steps completed per user (all time).
- Phase completion counts: per phase, total steps vs completed (aggregate across all users).

### Revenue

- One-time purchases count (paid).
- Active subscriptions count (active or trialing).
- MRR: only if `ADMIN_PRO_MONTHLY_CENTS` is set (cents per subscription per month). Example: `999` for $9.99.
- Churn indicator: subscriptions that were canceled in the last 30 days (count).

## What is intentionally NOT shown

- No individual user drill-down.
- No emails, names, user IDs, or IPs in the UI or in access logs.
- No raw SQL or stack traces in the UI (errors show a generic “Unable to load metrics” message).
- No impersonation or “view as user.”
- No way to edit user data from the admin dashboard.

## Technical details

- **Routes:** `/admin` only. Layout and page live under `app/(admin)/`.
- **Auth:** `lib/server/admin/requireAdmin.ts` enforces logged-in user + `profiles.is_admin`. Redirects to `/login` or `/dashboard` otherwise.
- **Analytics:** `lib/server/admin/analytics.ts` uses the **service role** client to run aggregate queries. No RLS bypass for user-level reads.
- **Access logging:** Timestamp-only log line on each admin load (`[admin] access <iso-timestamp>`). No IPs or user ids in logs.
- **SEO:** `robots: "noindex, nofollow"` on the admin layout so the dashboard is not indexed.

## Files

| Purpose | Path |
|--------|------|
| Admin gate | `lib/server/admin/requireAdmin.ts` |
| Access log | `lib/server/admin/logAccess.ts` |
| Analytics (service role, aggregates) | `lib/server/admin/analytics.ts` |
| Admin layout (noindex, nav) | `app/(admin)/layout.tsx` |
| Admin page + dashboard UI | `app/(admin)/admin/page.tsx`, `AdminDashboard.tsx` |
| DB flag | `supabase/migrations/00008_admin_flag.sql` |

## MRR configuration

Set `ADMIN_PRO_MONTHLY_CENTS` in the server environment to the monthly price per active Pro subscription in cents. For example:

- `999` → $9.99 per sub, MRR = (active subs) × $9.99
- Omitted or invalid → MRR shows “—” and the UI explains “Set ADMIN_PRO_MONTHLY_CENTS for MRR”.
