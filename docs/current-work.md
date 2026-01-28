# Currently working on

“Currently working on” tracks which roadmap step the user is actively working on. One row per user; switching step resets `started_at`.

---

## Data model

- **Table:** `current_work`
- **Primary key:** `user_id` (one row per user)
- **Columns:**
  - `user_id` uuid, PK, references `auth.users(id)` on delete cascade
  - `roadmap_id` uuid, references `roadmaps(id)` on delete set null
  - `phase_title` text
  - `step_id` uuid, references `roadmap_steps(id)` on delete set null
  - `status` text not null, default `'in_progress'`, check `('in_progress','paused','completed')`
  - `started_at` timestamptz not null, default now()
  - `updated_at` timestamptz default now()
- **RLS:** `user_id = auth.uid()` for select / insert / update / delete.

---

## Behavior

1. **Setting current step**
   - User clicks “Start this step” on the roadmap. The action verifies the step belongs to a roadmap owned by the user, then upserts `current_work` with `roadmap_id`, `phase_title`, `step_id`, `status = 'in_progress'`, and `started_at = now()`.
   - Switching to another step overwrites the row and resets `started_at`.

2. **Pause / resume**
   - Dashboard “In progress” card shows Pause when `status = 'in_progress'`, Resume when `status = 'paused'`.
   - `setWorkStatusAction(status)` updates `current_work.status` to `'in_progress'` or `'paused'`. `started_at` is not changed.

3. **Display**
   - **Roadmap:** The step with `current_work.step_id` is visually highlighted (e.g. ring). Each step has a “Start this step” button.
   - **Dashboard:** “In progress” card shows phase title, started date, and “X days in progress”. Buttons: Pause / Resume, “View on roadmap” (link to `/roadmap#step-{step_id}`).
   - If there is no current work and the user has a roadmap, the card shows an empty state: “Pick a step to start” with a CTA to the roadmap.

---

## Where it’s enforced

| Behavior | Where |
|----------|--------|
| Step belongs to user’s roadmap | `startStepAction`: load step → load roadmap by `step.roadmap_id` and `user_id`; reject if none. |
| Writes use session user | `startStepAction` and `setWorkStatusAction` use `requireUserAndProfile()` then DB helpers with `userId`. |
| One row per user | Table PK is `user_id`; `setCurrentWork` upserts on `user_id`. |

---

## DB helpers (`lib/server/db/currentWork.ts`)

- **getCurrentWork(userId)** — Returns the row or null.
- **setCurrentWork(userId, roadmapId, phaseTitle, stepId)** — Upserts on `user_id`; sets `status = 'in_progress'`, `started_at = now()`. Caller must ensure step ownership.
- **setCurrentWorkStatus(userId, status)** — Updates `status` to `'in_progress'`, `'paused'`, or `'completed'`.
- **clearCurrentWork(userId)** — Deletes the row (optional; e.g. for “Clear” or “Mark done”).

---

## Server actions

- **startStepAction** — Params: `step_id`, `phase_title`, `roadmap_id` (Zod-validated). Verifies step ownership, then `setCurrentWork(userId, roadmap_id, phase_title, step_id)`.
- **setWorkStatusAction** — Params: `status` (`'in_progress' | 'paused' | 'completed'`). Calls `setCurrentWorkStatus(userId, status)`.
