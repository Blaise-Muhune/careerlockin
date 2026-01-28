# Email (optional nudges and recaps)

Optional, calm email nudges focused on encouragement and clarity. Everything is opt-in and easy to turn off in Settings.

---

## Setup checklist (what you need for email to work)

### 1. Resend account and sending domain

1. Sign up at [resend.com](https://resend.com).
2. In the Resend dashboard, **Domains** → add and verify your sending domain (e.g. `yourdomain.com`). Until then you can use Resend’s sandbox domain for testing (see their docs).
3. **API Keys** → create an API key. Copy it for step 2.

### 2. Env vars (add to `.env.local` and production)

| Variable | Where to get it | Example |
|----------|-----------------|--------|
| `RESEND_API_KEY` | Resend → API Keys | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM_ADDRESS` | Your verified domain; must match Resend | `CareerLockin <noreply@careerlockin.com>` |
| `CRON_SECRET` | You choose a long random string | `a1b2c3d4...` (e.g. `openssl rand -hex 32`) |
| `NEXT_PUBLIC_APP_URL` | Your app’s public URL (for “View dashboard” links) | `https://yourapp.com` or `http://localhost:3000` |

Without `RESEND_API_KEY` and `EMAIL_FROM_ADDRESS`, sending is skipped (no crash). Without `CRON_SECRET`, cron routes return 401.

### 3. Database migration

Run the email-preferences migration in Supabase so the app can read/write prefs and the cron can record milestone sends:

1. Supabase Dashboard → **SQL Editor** → New query.
2. Paste the contents of **`supabase/migrations/00007_email_preferences.sql`**.
3. Run it.

This adds to `profiles`: `email_weekly_recap`, `email_inactivity_nudge`, `email_milestones`, `last_inactivity_nudge_at`, and creates the `email_milestone_sent` table.

Until this is run, Settings will load but the “Email preferences” section won’t show (the app treats missing columns as “no prefs yet”).

### 4. Cron / scheduler (so emails actually send)

Something has to call your cron API routes on a schedule.

**Option A – Vercel Cron** (if you deploy on Vercel):

- `vercel.json` already defines the cron jobs. In the Vercel project, set **Environment Variables** (including `CRON_SECRET`).
- Vercel will call your app; you must authorize those requests. Easiest: use **CRON_SECRET** in the URL (Vercel Cron does not add headers). In your app, the routes accept `?token=CRON_SECRET` as well as `Authorization: Bearer CRON_SECRET`.
- To use the query token with Vercel Cron, your cron “path” in Vercel must include the token, or you use an external scheduler (Option B) that can send the header/query.

**Option B – External cron (any host)**

Use a cron service (e.g. cron-job.org, GitHub Actions, or a server cron) to call:

- **Weekly recap:** `GET https://yourapp.com/api/cron/weekly-recap`  
  - Schedule: once per week (e.g. Sunday 20:00 UTC).
- **Inactivity:** `GET https://yourapp.com/api/cron/inactivity`  
  - Schedule: daily (e.g. 10:00 UTC).
- **Milestones:** `GET https://yourapp.com/api/cron/milestones`  
  - Schedule: daily (e.g. 12:00 UTC).

Protect each request with **one** of:

- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Query: `?token=YOUR_CRON_SECRET`

Replace `YOUR_CRON_SECRET` with the same value as `CRON_SECRET` in your env.

### 5. Verify

- **Settings:** After the migration, open **Settings** and confirm “Email preferences” and the three toggles appear. Turn them on/off; they should save without errors.
- **Cron:** Call a cron route manually with the secret, e.g.  
  `curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourapp.com/api/cron/weekly-recap`  
  You should get JSON like `{"sent": 0, "errors": []}` (or non-zero `sent` if there are eligible users and Resend is configured).

---

## Principles

- **One purpose per email.** No combined marketing + recap.
- **Short.** Skimmable in under 10 seconds.
- **Human.** No hype, no “AI will change your life,” no emojis.
- **Calm.** Help users stay consistent without feeling pressured.
- **No tracking.** No pixels, no third-party analytics in emails.

## What emails exist

| Email           | When it sends                               | Preference flag             |
|----------------|---------------------------------------------|-----------------------------|
| Weekly recap   | Once per week (e.g. Sunday 20:00 UTC)       | `email_weekly_recap`        |
| Inactivity nudge | When user has 0 minutes logged in last 7 days | `email_inactivity_nudge` |
| Milestone      | When user completes all steps in a phase   | `email_milestones`         |

No promotional emails. No “upgrade now” in these nudges.

## When they send

- **Weekly recap:** Cron runs once per week (see `vercel.json` or your scheduler). Only sends if `email_weekly_recap = true`.
- **Inactivity nudge:** Cron runs daily. Sends only if (a) user has 0 minutes in the last 7 days, (b) `email_inactivity_nudge = true`, (c) `last_inactivity_nudge_at` is null or older than 14 days. After sending, we set `last_inactivity_nudge_at = now()`.
- **Milestone:** Cron runs daily. Sends only if (a) user has a phase where all steps are done, (b) `email_milestones = true`, (c) we have not already sent for that (user, roadmap, phase). After sending, we insert into `email_milestone_sent`.

## Preference logic

- **Defaults:** New profiles get `email_weekly_recap = true`, `email_inactivity_nudge = true`, `email_milestones = true`. Existing rows get these via migration defaults.
- **Opt-out:** Users can turn off each type in Settings → Email preferences. Toggles save immediately. No “confirm unsubscribe” page; turning off stops that type of email for the next run.
- **RLS:** Users can read and update only their own `profiles.email_weekly_recap`, `email_inactivity_nudge`, `email_milestones`. `last_inactivity_nudge_at` and `email_milestone_sent` are server-only (cron uses service role).

## Anti-spam rules

- **Weekly recap:** At most one per user per week (schedule is once per week).
- **Inactivity nudge:** At most one per user per 14 days; only when they have 0 minutes in the last 7 days.
- **Milestone:** At most one per (user, roadmap, phase) ever; we record in `email_milestone_sent`.
- **No marketing.** These emails are only recap, nudge, and milestone. No upsells inside them.
- **Single link.** Only “View dashboard” (or equivalent); no multiple CTAs.

## Example subject lines and bodies

### Weekly recap

- **Subject:** Your week at a glance
- **Body (plain text):**  
  Your week at a glance.  
  Hours logged this week: 3.5 h  
  Steps completed: 2 of 16  
  Current: Foundational Knowledge · Learn Basic Networking  
  You're 6.5 hours away from your weekly goal.  
  View dashboard: https://yourapp.com/dashboard  

### Inactivity nudge

- **Subject:** Pick up where you left off
- **Body (plain text):**  
  You haven't logged time in a week. No pressure.  
  When you're ready, 15 minutes is enough to pick up where you left off.  
  View dashboard: https://yourapp.com/dashboard  

### Milestone

- **Subject:** Phase completed
- **Body (plain text):**  
  You finished Foundational Knowledge.  
  That phase built a solid base for what comes next.  
  View dashboard: https://yourapp.com/dashboard  

## Env and cron

| Env var              | Purpose                                |
|----------------------|----------------------------------------|
| `RESEND_API_KEY`     | Resend API key (from Resend dashboard) |
| `EMAIL_FROM_ADDRESS` | From header (e.g. `CareerLockin <noreply@careerlockin.com>`) |
| `CRON_SECRET`        | Secret for cron routes (header `Authorization: Bearer <secret>` or query `?token=<secret>`) |
| `NEXT_PUBLIC_APP_URL`| Base URL for “View dashboard” links    |

Cron routes:

- `GET /api/cron/weekly-recap`
- `GET /api/cron/inactivity`
- `GET /api/cron/milestones`

Protected by `CRON_SECRET`. Vercel Cron is configured in `vercel.json`; for other hosts, call these URLs on the intended schedule (e.g. weekly for recap, daily for inactivity and milestones).

## Opt-out behavior

- Changes in Settings → Email preferences are written to `profiles` immediately.
- The next cron run reads the current flags; if a user turned off “Weekly recap,” they are skipped for that run.
- No delay: opt-out is effective for the next run of that job (no “one more email” after unsubscribe).
