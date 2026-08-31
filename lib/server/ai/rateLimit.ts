import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/server/env";

const DEFAULT_PER_HOUR = 3;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw || raw.trim() === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function isRoadmapGenerationDisabled(): boolean {
  const v = getEnv().ROADMAP_GENERATION_DISABLED?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function getLlmGenerationsPerHour(): number {
  return parsePositiveInt(getEnv().LLM_GENERATIONS_PER_HOUR, DEFAULT_PER_HOUR);
}

export type LlmRateLimitResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Kill switch + per-user rolling-hour rate limit for OpenAI roadmap generation.
 * Uses service role so limits cannot be bypassed by deleting own rows (select-only RLS).
 */
export async function assertLlmGenerationAllowed(
  userId: string
): Promise<LlmRateLimitResult> {
  if (isRoadmapGenerationDisabled()) {
    return {
      ok: false,
      error: "Roadmap generation is temporarily disabled. Please try again later.",
    };
  }

  const limit = getLlmGenerationsPerHour();
  const supabase = createServiceRoleClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count, error: countError } = await supabase
    .from("llm_generation_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if (countError) {
    // Fail open on infra errors would burn money; fail closed with a soft message.
    return {
      ok: false,
      error: "Unable to verify generation limits. Please try again shortly.",
    };
  }

  if ((count ?? 0) >= limit) {
    return {
      ok: false,
      error: `Generation limit reached (${limit} per hour). Try again later.`,
    };
  }

  const { error: insertError } = await supabase
    .from("llm_generation_events")
    .insert({ user_id: userId });

  if (insertError) {
    return {
      ok: false,
      error: "Unable to start generation. Please try again shortly.",
    };
  }

  return { ok: true };
}
