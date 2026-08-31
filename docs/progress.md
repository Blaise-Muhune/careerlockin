# Progress & weekly check-ins

## Progress model

- **Table:** `progress`
- **Columns:** `id`, `user_id`, `step_id`, `is_done`, `done_at`, `created_at`, `updated_at`
- **Constraint:** `unique(user_id, step_id)` — one row per user per step.
- **RLS:** Users can only read/write rows where `user_id = auth.uid()`.

Progress is “step completed” state: which roadmap steps the user has marked done, and when.

**Phase progress** (e.g. “Xh of Yh done in this phase” on the dashboard “In progress” card) uses the user’s **weekly hours** from `profiles.weekly_hours` to show “~Z weeks at Nh/week” for the current phase. Phase totals and completed hours come from `roadmap_steps.est_hours` and `progress.is_done`; see `lib/server/roadmap/estimates.ts` (`getPhaseProgress`).

### Step ownership check

Before writing to `progress`, the server **must** ensure the step belongs to a roadmap owned by the current user. Otherwise a user could send an arbitrary `step_id` and create progress for another user’s step (still under their `user_id`, but for a step they don’t have access to).

**Implementation** (`lib/server/db/progress.ts` → `setStepDone`):

1. Load `roadmap_steps` row for `step_id` and get `roadmap_id`.
2. Load `roadmaps` row for that `roadmap_id` where `user_id = userId`.
3. If no such roadmap exists → throw (step does not belong to this user).
4. Otherwise upsert `progress` with `(user_id, step_id, is_done, done_at)`.

All writes use the **server session user id** from `requireUserAndProfile()`; the client cannot choose a different `user_id`.

---

## Weekly check-ins (legacy)

- **weekly_checkins** table and `lib/server/db/checkins.ts` remain for legacy data.
- The dashboard **Recent check-ins** UI was removed; weekly progress is shown via time logs and momentum, not check-in snapshots.
- Notes are per time log; there is no separate week-notes flow.
