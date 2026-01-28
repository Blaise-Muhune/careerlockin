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
import { getFallbackResource } from "@/lib/server/resources/fallbacks";

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

const SYSTEM_PROMPT = `You are a career roadmap generator focused on helping users land jobs in the current market. You have access to web_search. Use it to find the best, genuinely valuable learning resources—ones that will actually help the user get hired (skills employers want, up-to-date tools, interview-ready knowledge). Output a single JSON object that matches the schema below.

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
              "publisher": "<string> (domain or brand)",
              "resource_type": "video" | "course" | "playlist" | "certificate",
              "is_free": <boolean>,
              "source_id": "<string> (e.g. src_01, src_02 — must match a SOURCES entry from web_search)"
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Exactly 3 to 5 phases. Each phase has exactly 4 to 7 steps. Each step has 1 to 2 resources.
- est_hours must be a number (can be decimal).
- Do NOT invent URLs. Only use URLs that appear in the web_search SOURCES returned by the tool.
- Every resource must include source_id referencing the matching SOURCES item (e.g. src_01 for the first source URL).
- If a good source cannot be found in SOURCES, omit the resource rather than guessing.
- resources[].url MUST be https. No url shorteners. Any real, working link is fine: YouTube playlists, courses, Certificate of Completion, etc.
- Choose resources that give genuine value: current, job-relevant, and proven to help people get hired. Prioritize the best materials for the target role and today's market—not filler or outdated content.
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
    "1) Use web_search to find the best learning resources that will genuinely help this user land a job in the current market: up-to-date, job-relevant, and proven valuable (docs, courses, playlists, articles—only ones that actually give value).",
    "2) Build a tech career roadmap as a single JSON object. Attach 1–2 resources per step, using only URLs from the web_search SOURCES. Use source_id (src_01, src_02, …) to reference each source. Every resource should be something that truly helps someone get hired for the target role.",
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
  lines.push("", "Pick the best resources for the current job market. Use only https links from web_search SOURCES; no shorteners. Output only the JSON matching the schema.");
  return lines.join("\n");
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return trimmed;
  return trimmed.slice(start, end + 1);
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

type EnrichedResource = RoadmapResource & { verification_status: "verified" | "unverified" | "fallback"; is_fallback?: boolean };

function enforceGroundingAndValidation(
  parsed: RoadmapJson,
  sourcesMap: Map<string, SourceEntry>
): RoadmapJson {
  const phases = parsed.phases.map((phase) => ({
    ...phase,
    steps: phase.steps.map((step) => {
      const resources: EnrichedResource[] = step.resources.map((r) => {
        const entry = r.source_id ? sourcesMap.get(r.source_id) : undefined;
        const urlMatches = entry && r.url === entry.url;
        if (!r.source_id || !entry || !urlMatches) {
          const fallback = getFallbackResource(step.title, step.description);
          return {
            title: fallback.title,
            url: fallback.url,
            publisher: new URL(fallback.url).hostname,
            resource_type: "docs" as const,
            is_free: true,
            source_id: "",
            verification_status: "fallback" as const,
            is_fallback: true,
          };
        }
        const validation = validateUrl(r.url);
        if (validation.status === "invalid") {
          const fallback = getFallbackResource(step.title, step.description);
          return {
            title: fallback.title,
            url: fallback.url,
            publisher: new URL(fallback.url).hostname,
            resource_type: "docs" as const,
            is_free: true,
            source_id: r.source_id,
            verification_status: "fallback" as const,
            is_fallback: true,
          };
        }
        return {
          ...r,
          verification_status: validation.status === "valid" ? ("verified" as const) : ("unverified" as const),
          is_fallback: false,
        };
      });
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
              if (r.verification_status === "fallback" || r.is_fallback) return r;
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
    const model = "gpt-4.1-mini";

    const response = await openai.responses.create({
      model,
      instructions: SYSTEM_PROMPT,
      input: userPrompt,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      text: { format: zodTextFormat(roadmapJsonSchema, "roadmap") },
      temperature: 0.3,
    });

    const rawText = response.output_text?.trim();
    if (!rawText) {
      return { ok: false, error: "No response from the model." };
    }

    const jsonStr = extractJson(rawText);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr) as unknown;
    } catch {
      void logError("roadmap-generation", new Error("Response was not valid JSON"), {
        userId,
      });
      return { ok: false, error: "Could not parse roadmap. Try again." };
    }

    const parseResult = roadmapJsonSchema.safeParse(parsed);
    if (!parseResult.success) {
      const errMsg = parseResult.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("\n");
      void logError("roadmap-generation", new Error("Schema validation failed"), {
        userId,
        errMsg,
      });
      return { ok: false, error: "Roadmap did not match schema. Try again." };
    }

    const sourcesMap = buildSourcesMap(
      response.output as Array<{ type: string; action?: { sources?: Array<{ url: string }> } }>
    );
    let roadmap = enforceGroundingAndValidation(parseResult.data, sourcesMap);
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
