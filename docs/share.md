# Shareable progress snapshot

Users can share a progress snapshot as an image. Sharing is optional and never forced.

## What gets shared

A progress snapshot includes:

- **Target role** (e.g. "Frontend Developer")
- **Overall roadmap progress** (percent complete)
- **Current phase** (optional, user toggle)
- **Current step** (optional, user toggle)
- **Total hours invested** (optional, user toggle)
- **Caption:** "Working toward my tech career with a clear plan."
- **Footer:** "Created with CareerLockin"

No username, email, or internal IDs are included. No roadmap structure or step details beyond what the user chooses to show.

## Privacy

- Snapshots contain only progress summary data.
- User controls what to include via toggles (current step, total hours).
- No tracking pixels or analytics in the exported image.
- Sharing is always opt-in; the app never auto-posts.

## Entitlement differences

- **Free:** Snapshot is limited to Phase 1 progress only. `percent_complete` and scope reflect only Phase 1 steps. Current phase/step shown are Phase 1 context.
- **Plan Unlocked or Pro:** Full roadmap progress is used. `percent_complete` and current phase/step reflect the full roadmap.

## How it works

1. **Share progress** button (Dashboard and Roadmap) opens a modal.
2. Modal loads the snapshot from the server (`getProgressSnapshot`).
3. User can toggle "Include current phase and step" and "Include total hours".
4. **Download image** exports a PNG (canvas-drawn, no watermark except the subtle "Created with CareerLockin" footer).

## Gentle prompts

When roadmap progress hits 25%, 50%, 75%, or 100%, a short line appears near the Share progress button: "Want to share your progress?" It does not block workflow and is dismissible by design (no modal).

## Implementation

- **Server:** `lib/server/share/snapshot.ts` — `getProgressSnapshot(userId)`.
- **Action:** `app/actions/getProgressSnapshot.ts` — `getProgressSnapshotAction()` for the modal.
- **UI:** `components/share/ProgressSnapshotCard.tsx`, `ShareProgressModal.tsx`, `ShareProgressButton.tsx`.
