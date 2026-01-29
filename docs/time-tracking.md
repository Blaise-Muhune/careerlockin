# Time tracking

Time tracking is built from **default weekly hours** (profile) and **daily time logs** (`time_logs`). Each time log can have an optional note. **Recent check-ins** shows past weeks from `weekly_checkins` (legacy snapshots); new weeks are not written unless another flow populates them.

---

## Default weekly hours

- **Source:** `profiles.weekly_hours`, set during onboarding (1–60 hours per week).
- **Use:** Shown as “Planned” in the “This week” card. Used for the progress bar (completed / planned). Also used for **phase and roadmap timeframe estimates**: phase/roadmap total `est_hours` ÷ weekly hours = estimated weeks; see `lib/server/roadmap/estimates.ts` and `docs/ai-roadmap.md` (Timeframe estimates).
- **Access:** `getProfileWeeklyHours(userId)` in `lib/server/db/profiles.ts`. Used on the dashboard and roadmap when the user and profile are already guaranteed.

---

## Daily time logs

- **Table:** `time_logs`
- **Columns:** `id`, `user_id`, `log_date`, `minutes` (1–1440), `note`, `created_at`, `updated_at`
- **Index:** `(user_id, log_date)` for efficient per-week queries.
- **RLS:** `user_id = auth.uid()` for select / insert / update / delete.

Users add time whenever they work: date, minutes, and an optional note. There is no “planned_hours per week” in the app; planned comes from the profile.

### DB helpers (`lib/server/db/timeLogs.ts`)

- **addTimeLog(userId, logDate, minutes, note)** — insert one log. `minutes` must be 1–1440.
- **updateTimeLog(userId, id, minutes, note)** — update an existing log by id (and user).
- **deleteTimeLog(userId, id)** — delete by id (and user).
- **listTimeLogsForWeek(userId, weekStart, weekEnd)** — all logs with `log_date` between Monday and Sunday (inclusive). Used to compute weekly completed hours and to show the list for “This week”.

### Server actions

- **addTimeLogAction** — validated with Zod (`log_date` YYYY-MM-DD, `minutes` 1–1440, `note` optional, max 500).
- **editTimeLogAction** — `id` (uuid), `minutes` 1–1440, `note` optional.
- **deleteTimeLogAction** — `id` (uuid).

---

## Weekly sums (completed hours)

- **Current week:** Completed hours = `SUM(time_logs.minutes) / 60` for the current week (Monday–Sunday in America/Detroit). Computed on the server when rendering the dashboard.
- **Past weeks:** “Recent check-ins” reads from `weekly_checkins` (weeks that were previously saved). Notes are per time log; there is no separate “week notes” flow.

---

## Editing behavior

- **Add:** User picks date (default today), minutes, optional note → “Add” → new row in `time_logs`. Dashboard refreshes; “This week” completed hours and the list update.
- **Edit:** User clicks “Edit” on a time log, changes minutes and/or note, then “Save” → `updateTimeLog`. The list and weekly sum update after refresh.
- **Delete:** User clicks “Delete” on a time log → `deleteTimeLog`. The list and weekly sum update after refresh.

---

## Week boundaries

- **week_start:** Monday of the week in America/Detroit, `YYYY-MM-DD`. From `getDefaultWeekStartDetroit()` in `lib/weekStart.ts`.
- **week_end:** Sunday = `week_start + 6 days`. From `getWeekEndFromStart(weekStart)`.
- **time_logs:** Queried with `log_date >= week_start` and `log_date <= week_end`.
