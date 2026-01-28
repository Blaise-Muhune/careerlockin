# AI Roadmap Generation

## Environment variables

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for roadmap generation (server-only). |

Set in `.env.local`. Get a key from [OpenAI API keys](https://platform.openai.com/api-keys).

## JSON schema contract

The model must output **only** a single JSON object matching this structure (no markdown, no code fences):

```json
{
  "target_role": "<string>",
  "assumptions": {
    "weekly_hours": <number 1–60>,
    "current_level": "<string>",
    "time_horizon_weeks": <number 1–104>
  },
  "phases": [
    {
      "phase_title": "<string>",
      "phase_order": <positive int>,
      "steps": [
        {
          "title": "<string>",
          "description": "<string>",
          "est_hours": <number>,
          "step_order": <positive int>,
          "resources": [
            {
              "title": "<string>",
              "url": "<string>",
              "resource_type": "<string>",
              "is_free": <boolean>
            }
          ]
        }
      ]
    }
  ]
}
```

### Enforced rules

- **3 to 5 phases** (`phases.length`).
- **4 to 7 steps per phase** (`steps.length` in each phase).
- **1 to 2 resources per step** (`resources.length` in each step).
- `est_hours` must be a number (can be decimal).
- No extra keys; schema is strict (Zod `.strict()`). Unknown keys cause validation to fail.

The schema is implemented in `lib/server/ai/roadmapSchema.ts`.

### Approved resource domains and validation

Resource URLs must come from **approved domains** so links are trustworthy and non-fake.

- **Approved domains list:** `lib/server/resources/approvedSources.ts` exports `APPROVED_RESOURCE_DOMAINS`. Allowed hosts (and their subdomains) include:
  - `developer.mozilla.org`, `docs.python.org`, `react.dev`, `nextjs.org`, `supabase.com`, `stripe.com`, `freecodecamp.org`, `web.dev`, `learn.microsoft.com`, `typescriptlang.org`, `github.com`
- **Prompt rule:** The system prompt in `app/actions/generateRoadmap.ts` instructs the model that `resources[].url` MUST be an `https` URL whose host is one of these domains. If unsure, prefer MDN or official docs; do not invent or guess URLs.
- **Server-side validation:** Before saving, `createRoadmapFromJson` (in `lib/server/db/roadmaps.ts`) calls `validateResourceUrl` for each resource URL:
  - **Valid:** `https`, domain in approved list, not a shortener → stored as given.
  - **Invalid:** wrong scheme, wrong domain, or shortener → replaced with a **safe fallback** based on step topic (e.g. HTML/CSS/JS → MDN, React → react.dev/learn, Next.js → nextjs.org/docs, TypeScript → typescriptlang.org/docs; default MDN). See `lib/server/resources/fallbacks.ts`.
  - **Unknown:** domain approved but lightweight fetch failed (e.g. 403, network error) → URL is kept; `resource_type` is set to `"unverified"`. The UI shows a small “Verify later” badge for these so users know the link was not re-checked at save time.
- **URL validator:** `lib/server/resources/validateResourceUrl.ts` checks: valid `https` URL, host in approved list, rejection of known shortener domains. Optionally performs a lightweight HEAD (or GET with Range) to probe reachability; network/403 is treated as “unknown”, not auto-fail.
- During roadmap generation, validation uses `skipFetch: true` so only domain/scheme/shortener checks run, keeping save latency low.

### Timeframe estimates

`est_hours` per step drives **phase and roadmap timeframe estimates**. The app sums `est_hours` per phase (and for the whole roadmap), divides by the user’s `profiles.weekly_hours`, and shows “Estimated: X weeks” with “Calculated with your weekly hours: Yh/week”. Logic lives in `lib/server/roadmap/estimates.ts` (`calculatePhaseEstimates`, `calculateRoadmapTotal`). Null or missing `est_hours` are treated as 0 so calculations never fail.

## Profile inputs for personalization

The user prompt is built from profile fields so the roadmap fits the user’s goal, timeline, and learning style. All of these come from onboarding and are stored on `profiles`.

| Profile field | Source | Effect on roadmap |
|---------------|--------|-------------------|
| **goal_intent** (required) | Onboarding radio: job, internship, career_switch, skill_upgrade | Shapes focus (e.g. job-ready vs skill-up). |
| **target_timeline_weeks** (optional) | Onboarding dropdown: 8, 12, 16, 24 or “No deadline” | If set, used as `time_horizon_weeks` so the roadmap fits that length. |
| **prior_exposure** (optional) | Onboarding checkboxes: html_css, javascript, git, react, databases, apis, python, none | Instructs the model to skip or shorten early steps that cover those topics. |
| **learning_preference** (optional) | Onboarding radio: reading, video, project_first, mixed | Instructs the model to prefer matching resource types (e.g. video vs reading vs hands-on). |

Existing profiles get default `goal_intent = 'skill_upgrade'` and `null` for optional fields so generation still works.

## Retry / validation behavior

1. The server action calls the LLM with a **system prompt** (strict JSON, schema, rules) and a **user prompt** built from profile data (target_role, weekly_hours, current_level, time_horizon_weeks, goal_intent, target_timeline_weeks, prior_exposure, learning_preference).
2. Response text is parsed as JSON (after stripping surrounding text so only the outermost `{ ... }` is used).
3. The parsed object is validated with `roadmapJsonSchema`.
4. **If validation fails:** up to **2 retries** (3 attempts total). On retry, the assistant receives its previous raw output and a **correction prompt** that includes the Zod validation error messages (field path + message). No secrets or full tokens are included in the correction prompt.
5. **If valid:** the roadmap is written to `roadmaps`, `roadmap_steps`, and `resources` via `createRoadmapFromJson`, and the new roadmap id is returned.

## Where to change counts (phases / steps / resources)

| Rule | Location |
|------|----------|
| Phase count (3–5) | `lib/server/ai/roadmapSchema.ts`: `phases: z.array(phaseSchema).min(3).max(5)` |
| Steps per phase (4–7) | `lib/server/ai/roadmapSchema.ts`: `steps: z.array(stepSchema).min(4).max(7)` |
| Resources per step (1–2) | `lib/server/ai/roadmapSchema.ts`: `resources: z.array(resourceSchema).min(1).max(2)` |

Update the schema and the **system prompt** in `app/actions/generateRoadmap.ts` (the “Rules” section) so they stay in sync.

## Server-only

Roadmap generation runs only on the server:

- `app/actions/generateRoadmap.ts` is a Server Action.
- It uses `requireUserAndProfile()` and the Supabase server client; profile data and DB writes are server-side.
- `OPENAI_API_KEY` is read from `process.env` in the action; it is never sent to the client.
