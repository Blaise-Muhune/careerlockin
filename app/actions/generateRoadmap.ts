"use server";

import OpenAI from "openai";
import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEnv } from "@/lib/server/env";
import { logError } from "@/lib/server/logging";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { createClient } from "@/lib/supabase/server";
import { roadmapJsonSchema } from "@/lib/server/ai/roadmapSchema";
import { createRoadmapFromJson } from "@/lib/server/db/roadmaps";
import { APPROVED_RESOURCE_DOMAINS } from "@/lib/server/resources/approvedSources";

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

const APPROVED_DOMAINS_LIST = APPROVED_RESOURCE_DOMAINS.join(", ");

const SYSTEM_PROMPT = `You are a career roadmap generator. Output ONLY valid JSON with no surrounding text, no markdown, no code fences.

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
            { "title": "<string>", "url": "<string>", "resource_type": "<string>", "is_free": <boolean> }
          ]
        }
      ]
    }
  ]
}

Rules:
- Exactly 3 to 5 phases.
- Each phase has exactly 4 to 7 steps.
- Each step has 1 to 2 resources.
- est_hours must be a number (can be decimal).
- resources[].url MUST be an https URL whose host is one of these domains only: ${APPROVED_DOMAINS_LIST}. Subdomains (e.g. developer.mozilla.org) are allowed. Do not use url shorteners or any other domains.
- If unsure which link to use, prefer MDN (developer.mozilla.org) or the official docs for that tech (e.g. react.dev, nextjs.org, typescriptlang.org). Do not invent or guess URLs.
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
    "Generate a tech career roadmap as a single JSON object.",
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
  lines.push("", "Use the exact schema and rules from the system prompt. Output only the JSON.");
  return lines.join("\n");
}

function buildCorrectionPrompt(validationErrors: string): string {
  return `Your previous output was invalid. Validation errors:

${validationErrors}

Output a corrected JSON object that satisfies the schema and all rules. Output only the JSON, nothing else.`;
}

function extractJson(text: string): string {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return trimmed;
  return trimmed.slice(start, end + 1);
}

export async function generateRoadmap(
  timeHorizonWeeksOverride?: number
): Promise<GenerateRoadmapState> {
  const { userId } = await requireUserAndProfile();

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
    .select("target_role, weekly_hours, current_level")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) {
    return { ok: false, error: "Profile not found. Complete onboarding first." };
  }

  const input = profileInputSchema.safeParse({
    target_role: profile.target_role,
    weekly_hours: profile.weekly_hours,
    current_level: profile.current_level ?? "beginner",
    time_horizon_weeks: timeHorizonWeeksOverride ?? 16,
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
  const model = "gpt-4o-mini";

  let lastRaw: string | null = null;
  let lastValidationError: string | null = null;
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    if (attempt > 0 && lastValidationError) {
      messages.push({
        role: "assistant",
        content: lastRaw ?? "",
      });
      messages.push({
        role: "user",
        content: buildCorrectionPrompt(lastValidationError),
      });
    }

    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return { ok: false, error: "No response from the model." };
    }

    lastRaw = content;
    const jsonStr = extractJson(content);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr) as unknown;
    } catch {
      lastValidationError = "Output is not valid JSON.";
      continue;
    }

    const result = roadmapJsonSchema.safeParse(parsed);
    if (result.success) {
      const roadmapId = await createRoadmapFromJson(
        userId,
        result.data,
        model
      );
      return { ok: true, roadmapId };
    }

    const err = result.error;
    lastValidationError = err.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n");
  }

  void logError("roadmap-generation", new Error("Valid roadmap after retries failed"), {
    userId,
    lastValidationError: lastValidationError ?? undefined,
  });
  return {
    ok: false,
    error: "Could not generate valid roadmap after retries. Try again.",
  };
}
