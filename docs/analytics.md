# Analytics (lightweight, in-app only)

This doc describes what the app tracks, what it does not track, how encouragement works, and why analytics stay minimal.

## What we track

Aggregates used only for progress and motivation:

- **Time logs:** Sum of minutes per week; distinct days with at least one log per week. Used for “hours this week” and “days active this week” and for encouragement.
- **Roadmap progress:** Per-step completion (done/not done). Used for “steps completed,” “overall roadmap progress,” and per-phase completion.
- **Profile:** `weekly_hours` (onboarding). Used as the weekly goal for encouragement and “planned vs completed” messaging.

All of this is derived from existing tables: `time_logs`, `progress`, `profiles`, `roadmap_steps`. No separate analytics or event tables.

## What we do not track

- Detailed click or interaction events
- Personal text (notes, check-in text, roadmap content)
- Page views or session replay
- Anything sent to third-party analytics services

We only use aggregates needed to show progress and to pick one encouragement message.

## Encouragement logic

One message per user, chosen by rule order (first match wins):

1. **Goal hit:** If completed minutes this week ≥ planned (profile `weekly_hours` × 60) → “You hit your weekly goal. Nice work.”
2. **Zero progress:** If completed minutes this week is 0 → “Start with 15 minutes today.”
3. **Consistency:** If at least 3 distinct days have a time log this week → “Consistency is building.”
4. **Gap to goal:** If planned > 0 and completed &lt; planned → “You’re X hours away from your weekly goal.” (X rounded to one decimal.)
5. **Default:** “Every bit of progress counts.”

The message is computed from current-week stats only. It does not change during the day unless the user logs more time or steps, so it effectively updates at most when behavior changes (e.g. after logging).

## Why analytics are minimal by design

- **Retention and confidence:** Users should feel progress quickly (momentum strip, progress bar, one sentence of encouragement) without reading long copy or extra charts.
- **Support decisions, not distraction:** Data motivates action (e.g. “hours away from goal”) instead of adding dashboards or reports.
- **Privacy:** No fine-grained or personal tracking; only aggregates needed for progress and encouragement.
- **Scope:** Dashboard is primary; roadmap gets a light “Phase completed” badge when a phase is done. No emails or external analytics.

All logic is server-side, keyed by the authenticated user id. Helpers live in `lib/server/db/analytics.ts` and `lib/server/analytics/encouragement.ts`.
