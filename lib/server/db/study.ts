import "server-only";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { StudyMode } from "@/lib/study/chooseMode";
import type { StoredSchedule } from "@/lib/study/schedule";
import type { StudyCardView } from "@/lib/study/types";

export type OwnedStep = {
  id: string;
  roadmapId: string;
  phase: string;
  title: string;
  description: string;
  phaseProject: unknown;
  resourceUrl: string | null;
  resourceTitle: string | null;
};

export type StudyCardRow = StoredSchedule & {
  id: string;
  user_id: string;
  step_id: string;
  mode: Exclude<StudyMode, "rest">;
  example: string;
  steps: string[];
  step_index: number;
  try_this: string;
  question: string;
  focus: string | null;
  resource_url: string | null;
  resource_title: string | null;
  last_answer: string | null;
  last_correction: string | null;
  check_kind: "code" | "repo" | null;
  check_summary: string | null;
  created_at: string;
};

function readSteps(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, 5);
}

function isMode(value: string): value is Exclude<StudyMode, "rest"> {
  return value === "example" || value === "build" || value === "recall";
}

export function toStudyCardView(row: StudyCardRow, displayMode: StudyMode): StudyCardView {
  return {
    id: row.id,
    stepId: row.step_id,
    mode: row.mode,
    displayMode,
    example: row.example,
    steps: row.steps,
    stepIndex: row.step_index,
    tryThis: row.try_this,
    question: row.question,
    focus: row.focus,
    resourceUrl: row.resource_url,
    resourceTitle: row.resource_title,
    due: row.due,
    reps: row.reps,
    lastAnswer: row.last_answer,
    lastCorrection: row.last_correction,
    checkKind: row.check_kind,
    checkSummary: row.check_summary,
  };
}

export async function getOwnedStep(
  userId: string,
  stepId: string
): Promise<OwnedStep | null> {
  const supabase = await createClient();
  const { data: step } = await supabase
    .from("roadmap_steps")
    .select("id, roadmap_id, phase, title, description, phase_project")
    .eq("id", stepId)
    .maybeSingle();
  if (!step) return null;

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("id")
    .eq("id", step.roadmap_id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!roadmap) return null;

  const { data: resources } = await supabase
    .from("resources")
    .select("title, url")
    .eq("step_id", stepId)
    .limit(1);

  const resource = resources?.[0];
  return {
    id: step.id,
    roadmapId: step.roadmap_id,
    phase: step.phase,
    title: step.title,
    description: step.description,
    phaseProject: step.phase_project,
    resourceUrl: resource?.url ?? null,
    resourceTitle: resource?.title ?? null,
  };
}

function mapCard(row: Record<string, unknown>): StudyCardRow | null {
  if (
    typeof row.id !== "string" ||
    typeof row.user_id !== "string" ||
    typeof row.step_id !== "string" ||
    typeof row.mode !== "string" ||
    !isMode(row.mode) ||
    typeof row.example !== "string" ||
    typeof row.try_this !== "string" ||
    typeof row.question !== "string" ||
    typeof row.due !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    user_id: row.user_id,
    step_id: row.step_id,
    mode: row.mode,
    example: row.example,
    steps: readSteps(row.steps),
    step_index: Number(row.step_index ?? 0),
    try_this: row.try_this,
    question: row.question,
    focus: typeof row.focus === "string" ? row.focus : null,
    resource_url: typeof row.resource_url === "string" ? row.resource_url : null,
    resource_title: typeof row.resource_title === "string" ? row.resource_title : null,
    due: row.due,
    stability: Number(row.stability ?? 0),
    difficulty: Number(row.difficulty ?? 0),
    elapsed_days: Number(row.elapsed_days ?? 0),
    scheduled_days: Number(row.scheduled_days ?? 0),
    learning_steps: Number(row.learning_steps ?? 0),
    reps: Number(row.reps ?? 0),
    lapses: Number(row.lapses ?? 0),
    state: Number(row.state ?? 0),
    last_review: typeof row.last_review === "string" ? row.last_review : null,
    last_answer: typeof row.last_answer === "string" ? row.last_answer : null,
    last_correction: typeof row.last_correction === "string" ? row.last_correction : null,
    check_kind: row.check_kind === "code" || row.check_kind === "repo" ? row.check_kind : null,
    check_summary: typeof row.check_summary === "string" ? row.check_summary : null,
    created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
  };
}

export async function getStudyCard(
  userId: string,
  stepId: string
): Promise<StudyCardRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("study_cards")
    .select("*")
    .eq("user_id", userId)
    .eq("step_id", stepId)
    .maybeSingle();
  if (!data) return null;
  return mapCard(data as Record<string, unknown>);
}

export async function countRecentStudyCards(userId: string): Promise<number> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("study_cards")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  return count ?? 0;
}

export async function insertStudyCard(input: {
  userId: string;
  stepId: string;
  mode: Exclude<StudyMode, "rest">;
  example: string;
  tryThis: string;
  question: string;
  focus: string;
  steps: string[];
  resourceUrl: string | null;
  resourceTitle: string | null;
  schedule: StoredSchedule;
}): Promise<StudyCardRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("study_cards")
    .insert({
      user_id: input.userId,
      step_id: input.stepId,
      mode: input.mode,
      example: input.example,
      try_this: input.tryThis,
      question: input.question,
      focus: input.focus,
      steps: input.steps,
      step_index: input.steps.length >= 3 ? 1 : 0,
      resource_url: input.resourceUrl,
      resource_title: input.resourceTitle,
      ...input.schedule,
    })
    .select("*")
    .single();
  if (error || !data) return null;
  return mapCard(data as Record<string, unknown>);
}

export async function saveStudyReview(input: {
  userId: string;
  cardId: string;
  answer: string;
  rating: 1 | 2 | 3 | 4;
  correction: string;
  schedule: StoredSchedule;
}): Promise<boolean> {
  const supabase = await createClient();
  const { error: reviewError } = await supabase.from("study_reviews").insert({
    user_id: input.userId,
    card_id: input.cardId,
    answer: input.answer,
    rating: input.rating,
    correction: input.correction,
  });
  if (reviewError) return false;
  const { error } = await supabase
    .from("study_cards")
    .update({
      ...input.schedule,
      last_answer: input.answer,
      last_correction: input.correction,
      last_rating: input.rating,
    })
    .eq("id", input.cardId)
    .eq("user_id", input.userId);
  return !error;
}

export async function advanceStudyStep(input: {
  userId: string;
  cardId: string;
}): Promise<StudyCardRow | null> {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("study_cards")
    .select("*")
    .eq("id", input.cardId)
    .eq("user_id", input.userId)
    .maybeSingle();
  const card = current ? mapCard(current as Record<string, unknown>) : null;
  if (!card || card.steps.length < 3) return card;
  const nextIndex = Math.min(card.step_index < 1 ? 2 : card.step_index + 1, card.steps.length);
  if (nextIndex === card.step_index) return card;
  const { data, error } = await supabase
    .from("study_cards")
    .update({ step_index: nextIndex })
    .eq("id", input.cardId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error || !data) return null;
  return mapCard(data as Record<string, unknown>);
}

export async function saveCheckSummary(input: {
  userId: string;
  cardId: string;
  kind: "code" | "repo";
  summary: string;
}): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("study_cards")
    .update({ check_kind: input.kind, check_summary: input.summary })
    .eq("id", input.cardId)
    .eq("user_id", input.userId);
  return !error;
}

export async function applyMarketFlags(input: {
  roadmapId: string;
  userId: string;
  occupationTitle: string | null;
  signals: string[];
  optionalIds: string[];
  keepIds: string[];
  useServiceRole?: boolean;
}): Promise<void> {
  const supabase = input.useServiceRole ? createServiceRoleClient() : await createClient();
  await supabase.from("roadmap_market_snapshots").upsert({
    roadmap_id: input.roadmapId,
    user_id: input.userId,
    occupation_title: input.occupationTitle,
    signals: input.signals,
    refreshed_at: new Date().toISOString(),
  });
  if (input.optionalIds.length > 0) {
    await supabase
      .from("roadmap_steps")
      .update({ is_market_optional: true })
      .eq("roadmap_id", input.roadmapId)
      .in("id", input.optionalIds);
  }
  if (input.keepIds.length > 0) {
    await supabase
      .from("roadmap_steps")
      .update({ is_market_optional: false })
      .eq("roadmap_id", input.roadmapId)
      .in("id", input.keepIds);
  }
}
