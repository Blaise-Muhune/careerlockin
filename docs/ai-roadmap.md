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
      "phase_project": {
        "title": "<string>",
        "short_description": "<string (1–2 lines)>",
        "goal": "<string (what this prepares you for)>",
        "deliverables": ["<string>", "<string>", "<string>"],
        "estimated_time_hours": <number>,
        "is_optional": false
      },
      "steps": [
        {
          "title": "<string>",
          "description": "<string>",
          "est_hours": <number>,
          "step_order": <positive int>,
          "practices": [
            {
              "type": "project" | "challenge",
              "title": "<string>",
              "description": "<string (1 line)>",
              "purpose": "<string (why this matters)>",
              "difficulty": "easy" | "medium" | "hard",
              "is_optional": true
            }
          ],
          "resources": [
            {
              "title": "<string>",
              "url": "<string>",
              "publisher": "<string>",
              "resource_type": "docs" | "article" | "video" | "course",
              "is_free": <boolean>,
              "source_id": "<string>",
              "verification_status": "verified" | "unverified" | "fallback"
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
- **Exactly 1 phase project per phase** (`phase_project`).
- **0 to 2 optional practices per step** (`practices.length`).
- `est_hours` must be a number (can be decimal).
- No extra keys; schema is strict (Zod `.strict()`). Unknown keys cause validation to fail.

The schema is implemented in `lib/server/ai/roadmapSchema.ts`.

### Resource grounding and URL validation (no fake links)

Roadmap resources are grounded with web search so the model cannot invent links:

- **Grounding**: `generateRoadmap` uses the OpenAI Responses API with `web_search` and requests `web_search_call.action.sources`. Every resource must include `source_id` that matches the web-search sources, and the server enforces that `resource.url` exactly matches the selected source URL.
- **URL validation**: The server validates URLs (https + not a shortener) and optionally probes reachability (HEAD then GET). If invalid/unavailable, a safe fallback is substituted and `verification_status` is set to `"fallback"`.

This keeps the UX premium while preventing hallucinated or broken links.

### Why projects exist (premium, job-aligned)

Each phase includes exactly one **phase project** designed to simulate a real job task:

- Fewer, better projects (no filler)
- Phase-aligned (matches the skills taught in the phase)
- Written in professional language (“Build”, “Design”, “Implement”, “Simulate”)

These projects help users produce real portfolio artifacts and practice work-like delivery.

### Optional challenges philosophy

Steps can include 0–2 optional practices:

- **Project**: a small, optional implementation task that reinforces the step
- **Challenge**: optional interview practice (only when goal is job/internship and role is software engineering)

Challenges are never mandatory and are capped across the roadmap to avoid intimidation.

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
