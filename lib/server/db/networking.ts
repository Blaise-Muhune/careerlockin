import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getWeekEndFromStart } from "@/lib/weekStart";

export const NETWORKING_ACTION_TYPES = [
  "outreach_sent",
  "follow_up_sent",
  "comment_left",
  "post_published",
  "coffee_chat_requested",
] as const;

export type NetworkingActionType = (typeof NETWORKING_ACTION_TYPES)[number];

export type NetworkingPreference = "balanced" | "quiet" | "active";

export type ProfileNetworkingSettings = {
  linkedin_url: string | null;
  networking_weekly_goal: number;
  networking_preference: NetworkingPreference;
};

export type NetworkingActionInsert = {
  action_date: string; // YYYY-MM-DD
  action_type: NetworkingActionType;
  context_phase_id?: string | null;
  notes?: string | null;
};

export type NetworkingActionRow = {
  id: string;
  action_date: string;
  action_type: NetworkingActionType;
  context_phase_id: string | null;
  notes: string | null;
  created_at: string;
};

export async function getProfileNetworkingSettings(
  userId: string
): Promise<ProfileNetworkingSettings | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("linkedin_url, networking_weekly_goal, networking_preference")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    // If migrations haven't been applied yet, fail soft.
    if (/column .* does not exist/i.test(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;

  const pref =
    data.networking_preference === "quiet" || data.networking_preference === "active"
      ? (data.networking_preference as NetworkingPreference)
      : ("balanced" as const);

  return {
    linkedin_url: (data.linkedin_url as string | null) ?? null,
    networking_weekly_goal: Number(data.networking_weekly_goal ?? 1),
    networking_preference: pref,
  };
}

export async function updateProfileNetworkingSettings(
  userId: string,
  updates: Partial<ProfileNetworkingSettings>
): Promise<void> {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};

  if (typeof updates.linkedin_url === "string") {
    patch.linkedin_url = updates.linkedin_url.trim() || null;
  } else if (updates.linkedin_url === null) {
    patch.linkedin_url = null;
  }

  if (typeof updates.networking_weekly_goal === "number") {
    patch.networking_weekly_goal = updates.networking_weekly_goal;
  }

  if (typeof updates.networking_preference === "string") {
    patch.networking_preference = updates.networking_preference;
  }

  if (Object.keys(patch).length === 0) return;

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function insertNetworkingAction(
  userId: string,
  action: NetworkingActionInsert
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("networking_actions").insert({
    user_id: userId,
    action_date: action.action_date,
    action_type: action.action_type,
    context_phase_id: action.context_phase_id ?? null,
    notes: action.notes?.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function listNetworkingActionsForWeek(
  userId: string,
  weekStart: string
): Promise<NetworkingActionRow[]> {
  const supabase = await createClient();
  const weekEnd = getWeekEndFromStart(weekStart);

  const { data, error } = await supabase
    .from("networking_actions")
    .select("id, action_date, action_type, context_phase_id, notes, created_at")
    .eq("user_id", userId)
    .gte("action_date", weekStart)
    .lte("action_date", weekEnd)
    .order("action_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (/schema cache|networking_actions|relation .* does not exist|table .* does not exist|column .* does not exist/i.test(error.message))
      return [];
    throw new Error(error.message);
  }

  return (data ?? []).map((r) => ({
    id: r.id,
    action_date: r.action_date,
    action_type: r.action_type as NetworkingActionType,
    context_phase_id: (r.context_phase_id as string | null) ?? null,
    notes: (r.notes as string | null) ?? null,
    created_at: r.created_at,
  }));
}

export async function countNetworkingActionsForWeek(
  userId: string,
  weekStart: string
): Promise<number> {
  const supabase = await createClient();
  const weekEnd = getWeekEndFromStart(weekStart);
  const { count, error } = await supabase
    .from("networking_actions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("action_date", weekStart)
    .lte("action_date", weekEnd);

  if (error) {
    if (/schema cache|networking_actions|relation .* does not exist|table .* does not exist|column .* does not exist/i.test(error.message))
      return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

