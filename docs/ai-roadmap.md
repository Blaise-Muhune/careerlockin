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

Roadmap resources are grounded with web_search so the model cannot invent domains:

- **Grounding**: Keep resources whose URL exact-matches a search source, **or** shares a host with a search source (domain-grounded). Legacy hosts like `reactjs.org` are rewritten to `react.dev` first.
- **Reachability**: Verified URLs are probed (HEAD/GET). Clearly dead links are dropped.
- **Fallback**: If a step would have zero resources, a curated canonical doc is added (`verification_status = fallback`). The UI labels these “Curated”.
- **Unverified / invented hosts never ship**.

### Market realism

- Role-family **market guidance** is injected into the user prompt (`lib/server/ai/marketGuidance.ts`).
- Uniform padded hours are redistributed (`diversifyPhaseHours`); totals are scaled to `weekly_hours × time_horizon_weeks` (±15%).
- Generation uses **gpt-4.1** with web_search required.

## Profile inputs for personalization

| Profile field | Source | Effect on roadmap |
|---------------|--------|-------------------|
| **goal_intent** (required) | Onboarding | Shapes focus (job-ready vs skill-up). |
| **target_timeline_weeks** (optional) | Onboarding | Used as `time_horizon_weeks`. |
| **prior_exposure** (optional) | Freeform skill chips (and custom on regen forms) | Skip/shorten basics the user already knows. |
| **learning_preference** (optional) | Onboarding | Prefer matching resource types. |
| **target_role_job_description** (optional) | Onboarding / settings | Tailors steps to the JD. |

## Retry / validation behavior

1. LLM call with system + user prompt, required `web_search`, structured Zod schema.
2. Truncation/parse retries (up to 3 attempts).
3. Zod `safeParse`. On failure: **one correction prompt** with schema errors + previous JSON, then re-validate.
4. Post-process: practices normalize → grounding → reachability → ensure ≥1 resource → hour budget (steps + projects).
5. Persist via `createRoadmapFromJson` / `replaceRoadmapFromJson`.

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
