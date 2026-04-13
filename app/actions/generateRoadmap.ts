"use server";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEnv } from "@/lib/server/env";
import { logError } from "@/lib/server/logging";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { createClient } from "@/lib/supabase/server";
import { roadmapJsonSchema, type RoadmapJson, type RoadmapResource } from "@/lib/server/ai/roadmapSchema";
import { createRoadmapFromJson, replaceRoadmapFromJson, getRoadmapRegenerationCount } from "@/lib/server/db/roadmaps";
import { validateUrl, verifyUrlReachable } from "@/lib/server/resources/validateUrl";

const profileInputSchema = z.object({
  target_role: z.string().min(1),
  weekly_hours: z.number().int().min(1).max(60),
  current_level: z.string(),
  time_horizon_weeks: z.number().int().min(1).max(104).default(16),
  goal_intent: z.enum(["job", "internship", "career_switch", "skill_upgrade"]).default("skill_upgrade"),
  target_timeline_weeks: z.number().int().optional().nullable(),
  prior_exposure: z.array(z.string()).optional().nullable(),
  learning_preference: z.string().optional().nullable(),
  target_role_job_description: z.string().max(2000).optional().nullable(),
  /** Optional: add a final phase focused on hireability alongside AI tools (verification, judgment, portfolio proof). */
  include_ai_proof_module: z.boolean().default(false),
});

export type GenerateRoadmapState =
  | { ok: true; roadmapId: string }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `You are a career roadmap generator focused on helping users land jobs in the current market.

Execution policy:
- First gather sources with web_search (use multiple focused queries if needed).
- Then generate ONE strict JSON object matching the schema.
- Before final output, run a self-check against all rules and fix violations.
- Never invent URLs. If unsure, omit resources instead of guessing.

Quality bar:
- Prioritize practical, job-task simulation over tutorial-only learning.
- Prefer current, reputable resources over generic listicles.
- Keep language concise, professional, and action-oriented.

Output contract: return only the JSON object that matches the schema below.

Schema (strict, no extra keys):
{
  "target_role": "<string>",
  "assumptions": {
    "weekly_hours": <number 1-60>,
    "current_level": "<string>",
    "time_horizon_weeks": <number 1-104>
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
              "publisher": "<string> (domain or brand)",
              "resource_type": "video" | "course" | "playlist" | "certificate" | "article" | "documentation",
              "is_free": <boolean>,
              "source_id": "<string>"
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Exactly 3 to 5 phases. Each phase has exactly 4 to 7 steps. Each step has 1 to 2 resources.
- Each phase must include exactly ONE phase_project. Make it realistic, premium, and phase-aligned.
- Do not generate filler projects. Avoid beginner clichés (no todo/calculator/weather apps).
- Prefer “simulate a job task” over “build a demo app”. Example themes: SaaS feature implementation, auth flow, dashboard + analytics, API integration, data modeling, performance/UX hardening, deployment + monitoring.
- Steps may include 0–2 practices. Practices must be optional. If unsure, generate fewer items, not more.
- Coding challenges are allowed ONLY when (goal_intent is job OR internship) AND the target_role is software engineering. Never make challenges mandatory. Max 5–10 total challenges across the entire roadmap. Label as optional interview practice.
- est_hours must be a number (can be decimal).
- CRITICAL: You MUST use the web_search tool to find real URLs before generating resources. Do NOT invent URLs.
- Only use URLs that come directly from pages you found via web_search (copy-paste them exactly).
- If you cannot find a strong resource for a step, omit that resource entirely. Never guess or invent URLs.
- resources[].url MUST be https. No url shorteners.
- Every resource URL MUST come from web_search results. If web_search doesn't return good results, use fewer resources or omit them.
- Before outputting JSON, you must use web_search to find resources for each step.
- Choose resources that give genuine value: current, job-relevant, and proven to help people get hired. Prioritize the best materials for the target role and today's market—not filler or outdated content.
- Use professional language. Do not say “assignment”, “homework”, or “exercise”. Use: Build, Design, Implement, Simulate.
- When the user prompt begins with the exact line "AI-proof module: ENABLED", follow the AI-proof instructions in the user prompt. You MUST add exactly one dedicated phase as the LAST phase (highest phase_order) focused on staying hireable while using AI tools responsibly; that phase still obeys the same phase/step/resource rules as every other phase.
- Output only the JSON object, nothing else.`;

const WEB_SEARCH_TOOL = {
  type: "web_search" as const,
  external_web_access: true,
};

function buildUserPrompt(params: {
  target_role: string;
  weekly_hours: number;
  current_level: string;
  time_horizon_weeks: number;
  goal_intent: string;
  target_timeline_weeks: number | null | undefined;
  prior_exposure: string[] | null | undefined;
  learning_preference: string | null | undefined;
  target_role_job_description: string | null | undefined;
  include_ai_proof_module: boolean;
}): string {
  const lines: string[] = [];
  if (params.include_ai_proof_module) {
    lines.push(
      "AI-proof module: ENABLED",
      "",
      "AI-proof module requirements:",
      "- Add exactly ONE dedicated phase as the LAST phase (highest phase_order). Title it clearly for the user, e.g. Hireable in an AI-assisted workplace.",
      "- That phase must have 4-7 steps, one phase_project, and 1-2 grounded resources per step like every other phase.",
      "- Emphasize durable employability: validating AI-assisted output, specs/tests/checklists, communicating tradeoffs, portfolio artifacts that prove judgment (not generic AI slop), deepening role-specific fundamentals, and interview-ready stories tied to real decisions.",
      "- Treat AI as a workflow accelerant the user must own end-to-end; avoid hollow prompt-only hacks as the main substance.",
      "- Earlier phases may briefly reference verification or human ownership only where it fits naturally.",
      ""
    );
  }
  lines.push(
    "IMPORTANT: You MUST use web_search before generating the roadmap.",
    "Process:",
    "1) Use web_search to gather high-signal resources for the exact target role and current hiring expectations.",
    "2) Build a roadmap with practical phase projects that simulate day-to-day job tasks.",
    "3) Attach 1-2 resources per step using ONLY exact URLs from web_search sources.",
    "4) Run a self-check: schema validity, role relevance, timeline realism, no invented URLs, no filler projects.",
    "",
    `Target role: ${params.target_role}`,
    ...(params.target_role_job_description?.trim()
      ? [`Job description / requirements (use to tailor the roadmap):\n${params.target_role_job_description.trim()}`]
      : []),
    `Weekly hours available: ${params.weekly_hours}`,
    `Current level: ${params.current_level}`,
    `Time horizon (weeks): ${params.time_horizon_weeks}`,
    `Goal: ${params.goal_intent.replace("_", " ")}`,
  );
  if (params.target_timeline_weeks != null) {
    lines.push(`Target timeline: ${params.target_timeline_weeks} weeks (constrain roadmap to fit).`);
  }
  if (params.prior_exposure && params.prior_exposure.length > 0) {
    const exp = params.prior_exposure.filter((x) => x !== "none").join(", ") || "none";
    lines.push(`Prior exposure: ${exp}. Skip or shorten early steps that cover these.`);
  }
  if (params.learning_preference) {
    lines.push(`Learning preference: ${params.learning_preference.replace("_", " ")}. Prefer resources that match (e.g. video vs reading vs hands-on).`);
  }
  lines.push(
    "",
    "Project rules: 1 main phase project per phase, purposeful and job-relevant. Optional practices: only if they clearly reinforce the step, max 0–2 per step, always optional.",
    "Interview challenges: ONLY if goal is job/internship AND role is software engineering. Max 5–10 challenges across the entire roadmap. Label as optional interview practice.",
    "Timeline realism: keep total estimated hours aligned with weekly_hours * time_horizon_weeks (allow up to ~15% slack).",
    "Pick the best resources for the current job market. Use only https links from web_search SOURCES; no shorteners. Output only the JSON matching the schema."
  );
  return lines.join("\n");
}

function normalizeSourceUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    const params = parsed.searchParams;
    const keys = [...params.keys()];
    for (const key of keys) {
      if (
        key.startsWith("utm_") ||
        key === "ref" ||
        key === "ref_src" ||
        key === "source"
      ) {
        params.delete(key);
      }
    }
    const normalized = parsed.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return url.trim();
  }
}

function normalizeProjectsAndPractices(params: {
  roadmap: RoadmapJson;
  goalIntent: string;
  targetRole: string;
}): RoadmapJson {
  const eligibleForChallenges =
    (params.goalIntent === "job" || params.goalIntent === "internship") &&
    /software|engineer|developer/i.test(params.targetRole);

  // Cap total challenges across the roadmap (5–10 allowed; we enforce 10 hard max).
  const maxChallenges = 10;
  let challengeCount = 0;

  const phases = params.roadmap.phases.map((phase) => {
    const steps = phase.steps.map((step) => {
      const practices = (step.practices ?? []).filter((p) => {
        if (!p) return false;
        if (p.type === "challenge") {
          if (!eligibleForChallenges) return false;
          if (challengeCount >= maxChallenges) return false;
          challengeCount += 1;
        }
        return true;
      });

      return {
        ...step,
        practices: practices.slice(0, 2).map((p) => ({
          ...p,
          is_optional: true,
        })),
      };
    });

    return {
      ...phase,
      phase_project: {
        ...phase.phase_project,
        is_optional: false,
      },
      steps,
    };
  });

  return { ...params.roadmap, phases };
}

type SourceEntry = { url: string };

function buildSourcesMap(output: Array<{ type: string; action?: { sources?: Array<{ url: string }> } }>): Map<string, SourceEntry> {
  const map = new Map<string, SourceEntry>();
  let idx = 0;
  for (const item of output) {
    if (item.type !== "web_search_call" || !item.action?.sources) continue;
    for (const src of item.action.sources) {
      if (src?.url) {
        idx += 1;
        map.set(`src_${String(idx).padStart(2, "0")}`, { url: src.url });
      }
    }
  }
  return map;
}

type EnrichedResource = RoadmapResource & { verification_status: "verified" | "unverified" };

function enforceGroundingAndValidation(
  parsed: RoadmapJson,
  sourcesMap: Map<string, SourceEntry>
): RoadmapJson {
  const normalizedToSourceId = new Map<string, string>();
  for (const [id, entry] of sourcesMap.entries()) {
    normalizedToSourceId.set(normalizeSourceUrl(entry.url), id);
  }

  const findSourceIdForUrl = (url: string): string | null => {
    return normalizedToSourceId.get(normalizeSourceUrl(url)) ?? null;
  };

  const phases = parsed.phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      // Keep all resources; only drop clearly invalid URLs (non-https, shorteners).
      // If web_search didn't provide a match, keep the model's resource and mark unverified so the modal can show it.
      const resources: EnrichedResource[] = step.resources
        .map((r) => {
          const validation = validateUrl(r.url);
          if (validation.status === "invalid") {
            return null; // Skip only invalid URLs (e.g. not https, shorteners)
          }

          const sourceId = findSourceIdForUrl(r.url);
          const entry = sourceId ? sourcesMap.get(sourceId) : undefined;
          const fromSearch = Boolean(entry && r.url === entry.url);

          return {
            ...r,
            source_id: fromSearch ? (sourceId ?? r.source_id) : "",
            verification_status:
              fromSearch && validation.status === "valid"
                ? ("verified" as const)
                : ("unverified" as const),
          };
        })
        .filter((r): r is EnrichedResource => r !== null)
        .filter((resource, index, arr) => {
          const key = normalizeSourceUrl(resource.url);
          return arr.findIndex((candidate) => normalizeSourceUrl(candidate.url) === key) === index;
        })
        .slice(0, 2);
      
      return { ...step, resources };
    }),
  }));
  return { ...parsed, phases };
}

async function validateResourcesReachable(parsed: RoadmapJson): Promise<RoadmapJson> {
  const phases = await Promise.all(
    parsed.phases.map(async (phase) => ({
      ...phase,
      steps: await Promise.all(
        phase.steps.map(async (step) => ({
          ...step,
          resources: await Promise.all(
            step.resources.map(async (r) => {
              const reach = await verifyUrlReachable(r.url);
              if (reach.status === "unknown" && r.verification_status === "verified") {
                return { ...r, verification_status: "unverified" as const };
              }
              return r;
            })
          ),
        }))
      ),
    }))
  );
  return { ...parsed, phases };
}

function enforceRoadmapQuality(
  parsed: RoadmapJson,
  params: { weeklyHours: number; timeHorizonWeeks: number }
): RoadmapJson {
  const budgetHours = Math.max(1, params.weeklyHours * params.timeHorizonWeeks);
  const maxAllowed = budgetHours * 1.15;

  let totalHours = 0;
  const phases = parsed.phases.map((phase, phaseIndex) => {
    const steps = phase.steps.map((step, stepIndex) => {
      const safeHours = Number.isFinite(step.est_hours)
        ? Math.min(Math.max(step.est_hours, 1), budgetHours)
        : 1;
      totalHours += safeHours;
      return {
        ...step,
        step_order: stepIndex + 1,
        est_hours: safeHours,
      };
    });

    return {
      ...phase,
      phase_order: phaseIndex + 1,
      steps,
    };
  });

  if (totalHours <= maxAllowed) {
    return { ...parsed, phases };
  }

  const scale = maxAllowed / totalHours;
  const scaledPhases = phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => ({
      ...step,
      est_hours: Math.max(1, Number((step.est_hours * scale).toFixed(1))),
    })),
  }));

  return { ...parsed, phases: scaledPhases };
}

const PRO_ROADMAP_LIMIT = 5;

function parseFormDataToInput(formData: FormData | null) {
  if (!formData) return null;
  const target_role = formData.get("target_role");
  const weekly_hours = formData.get("weekly_hours");
  const current_level = formData.get("current_level");
  const goal_intent = formData.get("goal_intent");
  const target_timeline_weeks = formData.get("target_timeline_weeks");
  const prior_exposure = formData.getAll("prior_exposure");
  const learning_preference = formData.get("learning_preference");
  const target_role_job_description = formData.get("target_role_job_description");
  const include_ai_proof_module = formData.get("include_ai_proof_module") === "on";
  if (typeof target_role !== "string" || target_role.trim() === "") return null;
  if (weekly_hours === null || weekly_hours === undefined) return null;
  return {
    target_role: target_role.trim(),
    weekly_hours: Number(weekly_hours),
    current_level: typeof current_level === "string" ? current_level : "beginner",
    goal_intent: typeof goal_intent === "string" ? goal_intent : "skill_upgrade",
    target_timeline_weeks:
      target_timeline_weeks && typeof target_timeline_weeks === "string"
        ? Number(target_timeline_weeks) || null
        : null,
    prior_exposure: Array.isArray(prior_exposure)
      ? (prior_exposure as string[]).filter(Boolean)
      : null,
    learning_preference:
      typeof learning_preference === "string" && learning_preference.trim()
        ? learning_preference.trim()
        : null,
    target_role_job_description:
      typeof target_role_job_description === "string" && target_role_job_description.trim()
        ? target_role_job_description.trim()
        : null,
    include_ai_proof_module,
  };
}

export async function generateRoadmap(
  formData?: FormData | null
): Promise<GenerateRoadmapState> {
  const { userId } = await requireUserAndProfile();

  try {
    const [entitlements, supabase] = await Promise.all([
      getEntitlements(userId),
      createClient(),
    ]);

    const { count } = await supabase
      .from("roadmaps")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    const roadmapCount = count ?? 0;

    if (entitlements.canGenerateExtraRoadmaps) {
      if (roadmapCount >= PRO_ROADMAP_LIMIT) {
        return {
          ok: false,
          error: `Pro users can have up to ${PRO_ROADMAP_LIMIT} roadmaps. Delete one to create a new one.`,
        };
      }
    } else {
      if (roadmapCount >= 1) {
        return {
          ok: false,
          error: "Upgrade to Pro to create more than one roadmap (up to 5).",
        };
      }
    }

    const customInput = parseFormDataToInput(formData ?? null);

    let input: { success: true; data: z.infer<typeof profileInputSchema> } | { success: false };

    if (customInput) {
      input = profileInputSchema.safeParse({
        target_role: customInput.target_role,
        weekly_hours: customInput.weekly_hours,
        current_level: customInput.current_level,
        time_horizon_weeks: customInput.target_timeline_weeks ?? 16,
        goal_intent: customInput.goal_intent,
        target_timeline_weeks: customInput.target_timeline_weeks,
        prior_exposure: customInput.prior_exposure,
        learning_preference: customInput.learning_preference,
        target_role_job_description: customInput.target_role_job_description,
        include_ai_proof_module: customInput.include_ai_proof_module,
      });
    } else {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "target_role, weekly_hours, current_level, goal_intent, target_timeline_weeks, prior_exposure, learning_preference, target_role_job_description"
        )
        .eq("user_id", userId)
        .single();

      if (profileError || !profile) {
        return { ok: false, error: "Profile not found. Complete onboarding first." };
      }

      input = profileInputSchema.safeParse({
        target_role: profile.target_role,
        weekly_hours: profile.weekly_hours,
        current_level: profile.current_level ?? "beginner",
        time_horizon_weeks: profile.target_timeline_weeks ?? 16,
        goal_intent: profile.goal_intent ?? "skill_upgrade",
        target_timeline_weeks: profile.target_timeline_weeks ?? null,
        prior_exposure: profile.prior_exposure ?? null,
        learning_preference: profile.learning_preference ?? null,
        target_role_job_description: profile.target_role_job_description ?? null,
        include_ai_proof_module: false,
      });
    }

    if (!input.success) {
      return {
        ok: false,
        error: "Invalid input. Check target role and weekly hours.",
      };
    }

    const apiKey = getEnv().OPENAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "OpenAI is not configured." };
    }

    const openai = new OpenAI({ apiKey });
    const userPrompt = buildUserPrompt({
      ...input.data,
      target_timeline_weeks: input.data.target_timeline_weeks ?? null,
      prior_exposure: input.data.prior_exposure ?? null,
      learning_preference: input.data.learning_preference ?? null,
      target_role_job_description: input.data.target_role_job_description ?? null,
    });
    // Use gpt-4o-mini which has better token limits and JSON handling
    const model = "gpt-4.1-mini";

    // Retry logic for truncated responses
    let response;
    let parsed: unknown;
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await openai.responses.parse({
          model,
          instructions: SYSTEM_PROMPT,
          input: userPrompt,
          tools: [WEB_SEARCH_TOOL],
          tool_choice: "required",
          include: ["web_search_call.action.sources"],
          text: { format: zodTextFormat(roadmapJsonSchema, "roadmap") },
          temperature: 0.3,
          max_output_tokens: 16000, // Large roadmaps need more tokens
        });
        
        // Log response structure for debugging
        if (process.env.NODE_ENV !== "production") {
          console.log("[generateRoadmap] Response has output_parsed:", !!response.output_parsed);
          console.log("[generateRoadmap] Response output items:", response.output?.map((o: { type: string }) => o.type) ?? []);
        }

        if (response.output_parsed) {
          parsed = response.output_parsed;
          break; // Success, exit retry loop
        }

        // If output_parsed is missing but output_text exists, try manual parse
        const rawText = response.output_text?.trim();
        if (rawText) {
          function extractJson(text: string): string {
            const trimmed = text.trim();
            const start = trimmed.indexOf("{");
            const end = trimmed.lastIndexOf("}");
            if (start === -1 || end === -1 || end <= start) return trimmed;
            return trimmed.slice(start, end + 1);
          }

          const jsonStr = extractJson(rawText);
          // Check if JSON looks truncated (ends abruptly or very short)
          if (jsonStr.length < 1000 && !jsonStr.endsWith("}")) {
            throw new Error(`JSON appears truncated (length: ${jsonStr.length}). Retrying...`);
          }

          try {
            parsed = JSON.parse(jsonStr);
            break; // Success, exit retry loop
          } catch (parseErr) {
            // Re-throw as truncation error if JSON is short and malformed
            const parseMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
            if (jsonStr.length < 2000 && (parseMsg.includes("position") || parseMsg.includes("Unterminated"))) {
              throw new Error(`JSON parse failed - likely truncated: ${parseMsg}. Length: ${jsonStr.length}`);
            }
            throw parseErr; // Re-throw original error
          }
        }

        throw new Error("No output_parsed or output_text received");
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const isTruncated = lastError.message.includes("truncated") || 
                           lastError.message.includes("Unterminated") ||
                           lastError.message.includes("position") ||
                           (lastError.message.includes("JSON length") && attempt < maxRetries);

        if (!isTruncated || attempt === maxRetries) {
          // Not a truncation error or out of retries
          void logError("roadmap-generation", lastError, {
            userId,
            attempt,
            outputText: response?.output_text?.slice(0, 500),
          });
          if (process.env.NODE_ENV !== "production") {
            return {
              ok: false,
              error: `Dev parse error: ${lastError.message}. Attempt ${attempt + 1}/${maxRetries + 1}.`,
            };
          }
          return { ok: false, error: "Could not parse roadmap. Try again." };
        }

        // Truncation detected, wait a bit and retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }

    if (!parsed || !response) {
      return { ok: false, error: "Failed to generate roadmap after retries." };
    }

    const parseResult = roadmapJsonSchema.safeParse(parsed);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n");
      void logError("roadmap-generation", new Error("Schema validation failed"), {
        userId,
        errMsg,
        outputParsed: JSON.stringify(parsed).slice(0, 500),
      });
      if (process.env.NODE_ENV !== "production") {
        return {
          ok: false,
          error: `Dev schema error: ${errMsg}`,
        };
      }
      return { ok: false, error: "Roadmap did not match schema. Try again." };
    }

    const sourcesMap = buildSourcesMap(
      response.output as Array<{ type: string; action?: { sources?: Array<{ url: string }> } }>
    );
    
    // Log sources for debugging
    if (process.env.NODE_ENV !== "production") {
      const sourcesCount = sourcesMap.size;
      const sourcesList = Array.from(sourcesMap.entries()).map(([id, entry]) => `${id}: ${entry.url}`);
      console.log(`[generateRoadmap] Found ${sourcesCount} web_search sources:`, sourcesList);
      if (sourcesCount === 0) {
        console.warn("[generateRoadmap] WARNING: No web_search sources found. Check if model used web_search tool.");
        console.log("[generateRoadmap] Response output types:", response.output?.map((o: { type: string }) => o.type));
      }
    }
    
    let roadmap = normalizeProjectsAndPractices({
      roadmap: parseResult.data,
      goalIntent: input.data.goal_intent,
      targetRole: input.data.target_role,
    });
    roadmap = enforceGroundingAndValidation(roadmap, sourcesMap);
    roadmap = await validateResourcesReachable(roadmap);
    roadmap = enforceRoadmapQuality(roadmap, {
      weeklyHours: input.data.weekly_hours,
      timeHorizonWeeks: input.data.time_horizon_weeks,
    });

    const roadmapId = await createRoadmapFromJson(userId, roadmap, model);
    return { ok: true, roadmapId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    void logError("roadmap-generation", err instanceof Error ? err : new Error(msg), {
      userId,
      hint:
        "Likely causes: missing OPENAI_API_KEY, model access issue (gpt-5.2), or unapplied DB migrations (resources columns).",
    });

    // In development, surface the concrete error message to make debugging easier.
    if (process.env.NODE_ENV !== "production") {
      return {
        ok: false,
        error: `Dev error: ${msg}`,
      };
    }

    // Surface a safe, actionable message without leaking internal details.
    if (/column .* does not exist/i.test(msg)) {
      return {
        ok: false,
        error:
          "Roadmap generation is temporarily unavailable (database upgrade pending). Please try again shortly.",
      };
    }
    if (/api key|unauthorized|invalid_api_key/i.test(msg)) {
      return { ok: false, error: "Roadmap generation is not configured. Please contact support." };
    }
    if (/model|not found|does not exist/i.test(msg)) {
      return { ok: false, error: "Roadmap generation model is unavailable. Please try again later." };
    }
    return { ok: false, error: "Could not create your roadmap. Please try again." };
  }
}

export type RegenerateRoadmapState = GenerateRoadmapState;

export async function regenerateRoadmap(
  _prev: RegenerateRoadmapState | null,
  formData: FormData
): Promise<RegenerateRoadmapState> {
  const roadmapId = formData.get("roadmap_id");
  if (typeof roadmapId !== "string" || !roadmapId.trim()) {
    return { ok: false, error: "Roadmap ID is required." };
  }
  const { userId } = await requireUserAndProfile();

  try {
    const regCount = await getRoadmapRegenerationCount(userId, roadmapId);
    if (regCount === null) {
      return { ok: false, error: "Roadmap not found or access denied." };
    }
    if (regCount >= 1) {
      return { ok: false, error: "You have already used your 1 regeneration for this roadmap." };
    }

    const customInput = parseFormDataToInput(formData);
    if (!customInput) {
      return { ok: false, error: "Invalid input. Provide target role and weekly hours." };
    }

    const input = profileInputSchema.safeParse({
      target_role: customInput.target_role,
      weekly_hours: customInput.weekly_hours,
      current_level: customInput.current_level,
      time_horizon_weeks: customInput.target_timeline_weeks ?? 16,
      goal_intent: customInput.goal_intent,
      target_timeline_weeks: customInput.target_timeline_weeks,
      prior_exposure: customInput.prior_exposure,
      learning_preference: customInput.learning_preference,
      target_role_job_description: customInput.target_role_job_description,
      include_ai_proof_module: customInput.include_ai_proof_module,
    });

    if (!input.success) {
      return { ok: false, error: "Invalid input. Check target role and weekly hours." };
    }

    const apiKey = getEnv().OPENAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "OpenAI is not configured." };
    }

    const openai = new OpenAI({ apiKey });
    const userPrompt = buildUserPrompt({
      ...input.data,
      target_timeline_weeks: input.data.target_timeline_weeks ?? null,
      prior_exposure: input.data.prior_exposure ?? null,
      learning_preference: input.data.learning_preference ?? null,
      target_role_job_description: input.data.target_role_job_description ?? null,
      include_ai_proof_module: input.data.include_ai_proof_module,
    });
    const model = "gpt-4.1-mini";

    type ParseResponse = Awaited<ReturnType<typeof openai.responses.parse>>;
    let response: ParseResponse | undefined;
    let parsed: unknown;
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        response = await openai.responses.parse({
          model,
          instructions: SYSTEM_PROMPT,
          input: userPrompt,
          tools: [WEB_SEARCH_TOOL],
          tool_choice: "required",
          include: ["web_search_call.action.sources"],
          text: { format: zodTextFormat(roadmapJsonSchema, "roadmap") },
          temperature: 0.3,
          max_output_tokens: 16000,
        });

        if (response.output_parsed) {
          parsed = response.output_parsed;
          break;
        }

        const rawText = response.output_text?.trim();
        if (rawText) {
          const start = rawText.indexOf("{");
          const end = rawText.lastIndexOf("}");
          const jsonStr = start >= 0 && end > start ? rawText.slice(start, end + 1) : rawText;
          if (jsonStr.length < 1000 && !jsonStr.endsWith("}")) {
            throw new Error(`JSON appears truncated. Retrying...`);
          }
          try {
            parsed = JSON.parse(jsonStr);
            break;
          } catch (parseErr) {
            const parseMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
            if (jsonStr.length < 2000 && parseMsg.includes("position")) {
              throw new Error(`JSON parse failed - likely truncated. Retrying...`);
            }
            throw parseErr;
          }
        }
        throw new Error("No output received");
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        const isTruncated = lastError.message.includes("truncated") || attempt < maxRetries;
        if (!isTruncated) {
          void logError("roadmap-regeneration", lastError, { userId, roadmapId });
          return { ok: false, error: "Could not regenerate roadmap. Try again." };
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    if (!parsed || !response) {
      return { ok: false, error: "Failed to generate roadmap after retries." };
    }

    const parseResult = roadmapJsonSchema.safeParse(parsed);
    if (!parseResult.success) {
      void logError("roadmap-regeneration", new Error("Schema validation failed"), {
        userId,
        roadmapId,
      });
      return { ok: false, error: "Roadmap did not match schema. Try again." };
    }

    const sourcesMap = buildSourcesMap(
      (response.output ?? []) as Array<{ type: string; action?: { sources?: Array<{ url: string }> } }>
    );

    let roadmap = normalizeProjectsAndPractices({
      roadmap: parseResult.data,
      goalIntent: input.data.goal_intent,
      targetRole: input.data.target_role,
    });
    roadmap = enforceGroundingAndValidation(roadmap, sourcesMap);
    roadmap = await validateResourcesReachable(roadmap);
    roadmap = enforceRoadmapQuality(roadmap, {
      weeklyHours: input.data.weekly_hours,
      timeHorizonWeeks: input.data.time_horizon_weeks,
    });

    await replaceRoadmapFromJson(userId, roadmapId, roadmap, model);
    return { ok: true, roadmapId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    void logError("roadmap-regeneration", err instanceof Error ? err : new Error(msg), {
      userId,
      roadmapId,
    });
    if (process.env.NODE_ENV !== "production") {
      return { ok: false, error: `Dev error: ${msg}` };
    }
    return { ok: false, error: "Could not regenerate your roadmap. Please try again." };
  }
}
