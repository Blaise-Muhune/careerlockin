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
import { createRoadmapFromJson } from "@/lib/server/db/roadmaps";
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
});

export type GenerateRoadmapState =
  | { ok: true; roadmapId: string }
  | { ok: false; error: string };

const SYSTEM_PROMPT = `You are a career roadmap generator focused on helping users land jobs in the current market. You have access to web_search. Use it to find the best, genuinely valuable resources and realistic, job-aligned projects—things that actually prepare the user for day-to-day work and interviews. Output a single JSON object that matches the schema below.

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
              "resource_type": "video" | "course" | "playlist" | "certificate",
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
- Output only the JSON object, nothing else.`;

function buildUserPrompt(params: {
  target_role: string;
  weekly_hours: number;
  current_level: string;
  time_horizon_weeks: number;
  goal_intent: string;
  target_timeline_weeks: number | null | undefined;
  prior_exposure: string[] | null | undefined;
  learning_preference: string | null | undefined;
}): string {
  const lines: string[] = [
    "IMPORTANT: You MUST use the web_search tool FIRST to find real learning resources before generating the roadmap. Search for courses, tutorials, documentation, YouTube playlists, certificates, and articles that are current, job-relevant, and genuinely valuable for the target role.",
    "1) Use web_search NOW to find the best learning resources that will genuinely help this user land a job in the current market: up-to-date, job-relevant, and proven valuable (courses, playlists, certificates, YouTube videos or playlists, articles—only ones that actually give value).",
    "2) After finding resources via web_search, build a tech career roadmap as a single JSON object with phases, steps, a phase-aligned project per phase, and optional practices. Projects must simulate real job tasks (SaaS feature, dashboard, API integration, auth flow, data modeling, etc.) and avoid beginner clichés.",
    "3) Attach 1–2 resources per step, using ONLY real URLs from the web_search results (copy-paste them exactly from the sources). If you cannot find good resources, use fewer or none—never invent URLs. Every resource must come from web_search sources.",
    "",
    `Target role: ${params.target_role}`,
    `Weekly hours available: ${params.weekly_hours}`,
    `Current level: ${params.current_level}`,
    `Time horizon (weeks): ${params.time_horizon_weeks}`,
    `Goal: ${params.goal_intent.replace("_", " ")}`,
  ];
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
    "Pick the best resources for the current job market. Use only https links from web_search SOURCES; no shorteners. Output only the JSON matching the schema."
  );
  return lines.join("\n");
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
  const findSourceIdForUrl = (url: string): string | null => {
    for (const [id, entry] of sourcesMap.entries()) {
      if (entry.url === url) return id;
    }
    return null;
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
        .filter((r): r is EnrichedResource => r !== null);
      
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

export async function generateRoadmap(
  timeHorizonWeeksOverride?: number
): Promise<GenerateRoadmapState> {
  const { userId } = await requireUserAndProfile();

  try {
    const [entitlements, supabase] = await Promise.all([
      getEntitlements(userId),
      createClient(),
    ]);

    if (!entitlements.canGenerateExtraRoadmaps) {
      const { count } = await supabase
        .from("roadmaps")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((count ?? 0) >= 1) {
        return {
          ok: false,
          error: "Upgrade to Pro to generate more than one roadmap.",
        };
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "target_role, weekly_hours, current_level, goal_intent, target_timeline_weeks, prior_exposure, learning_preference"
      )
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return { ok: false, error: "Profile not found. Complete onboarding first." };
    }

    const input = profileInputSchema.safeParse({
      target_role: profile.target_role,
      weekly_hours: profile.weekly_hours,
      current_level: profile.current_level ?? "beginner",
      time_horizon_weeks:
        timeHorizonWeeksOverride ?? (profile.target_timeline_weeks ?? 16),
      goal_intent: profile.goal_intent ?? "skill_upgrade",
      target_timeline_weeks: profile.target_timeline_weeks ?? null,
      prior_exposure: profile.prior_exposure ?? null,
      learning_preference: profile.learning_preference ?? null,
    });

    if (!input.success) {
      return {
        ok: false,
        error: "Invalid profile data. Check target role and weekly hours.",
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
          tools: [{ type: "web_search" }],
          tool_choice: "auto", // Let model decide, but prompt strongly encourages web_search
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
