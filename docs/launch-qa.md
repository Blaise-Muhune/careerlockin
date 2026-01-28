# Production QA checklist

Step-by-step test cases to run before and after launch. Execute in order where dependencies matter.

## Auth

- [ ] **Signup** – New email can sign up; confirmation/redirect works; profile does not exist until onboarding.
- [ ] **Login** – Existing user can log in; redirect to dashboard if profile exists, to onboarding if not.
- [ ] **Logout** – Logout clears session; visiting `/dashboard` or `/roadmap` redirects to login or home.
- [ ] **Protected routes** – Unauthenticated access to `/dashboard`, `/roadmap`, `/settings`, `/onboarding` redirects as intended (login or home).

## Onboarding

- [ ] **Saves profile** – Target role, weekly hours, and other onboarding fields persist after submit.
- [ ] **Redirect after onboarding** – User is sent to dashboard or next step (e.g. roadmap generation), not stuck on onboarding.

## Roadmap

- [ ] **Generate roadmap** – From dashboard or onboarding, “Generate roadmap” completes and a roadmap is created; user can open it.
- [ ] **Resources validated** – Generated steps only include resources from approved domains; invalid or blocked URLs are not stored.
- [ ] **Locked states** – Free vs Plan Unlocked vs Pro behave correctly:
  - Free: Lock banner or paywall where appropriate; upgrade CTAs work.
  - Plan Unlocked: One-time unlock flow; roadmap (or intended scope) is fully visible and usable.
  - Pro: Subscription flow; Pro-only features (e.g. tracking, charts) are visible and working.

## Tracking

- [ ] **Time logs** – Add, edit, and delete time log entries; totals and lists update as expected.
- [ ] **Current work** – Start, pause, and resume “current work” for a step; state persists and reflects in UI (e.g. dashboard, roadmap).

## Billing

- [ ] **One-time unlock checkout** – Unlock product goes through Stripe Checkout; success/cancel redirects work; entitlement (e.g. “Plan Unlocked”) is reflected in app.
- [ ] **Subscription checkout** – Pro subscription goes through Stripe Checkout; success/cancel redirects work; Pro entitlement is reflected.
- [ ] **Webhook updates entitlements** – After a successful payment or subscription event, refresh the app (or re-open settings); purchase/subscription status and entitlements match Stripe (no manual DB edits).
- [ ] **Cancel subscription** – Canceling Pro in Stripe (or via billing portal) updates access; user loses Pro-only features after period end (or immediately, per product rules).

## Email (if enabled)

- [ ] **Preferences toggle** – Email preference toggles (e.g. weekly recap, milestones) save and persist.
- [ ] **Send test email** – If a guarded dev/test route exists, sending a test email succeeds and nothing secret is logged.

## Mobile

- [ ] **Dashboard usable** – Dashboard is usable on a small viewport; key actions (e.g. “View roadmap”, “Start step”) are reachable and work.
- [ ] **Roadmap accordion + modal** – Roadmap phases/steps expand and collapse; step detail modal opens, scrolls, and closes correctly on mobile.

## Share

- [ ] **Snapshot export** – Snapshot or export feature runs without error; output does not contain private info (e.g. emails, internal ids) that should stay server-only.

## Post-deploy smoke test order

1. **Public** – Load landing, `/blog`, `/legal`; check one blog post. Confirm sitemap/robots/llms.txt if applicable.
2. **Auth** – Sign up (or use a test account), log in, log out.
3. **Onboarding** – Complete onboarding for a new user; confirm profile saved.
4. **Roadmap** – Generate a roadmap; open it; confirm steps and resources.
5. **Billing** – Run one test checkout (unlock or subscription) in test mode; confirm webhook and entitlements.
6. **Status** – `GET /api/status` returns `ok: true` and expected env/version fields.
