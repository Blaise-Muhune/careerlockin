"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import {
  countRecentStudyCards,
  getOwnedStep,
  getStudyCard,
  insertStudyCard,
  saveCheckSummary,
  saveStudyReview,
  toStudyCardView,
} from "@/lib/server/db/study";
import { getProfileForRoadmapEdit } from "@/lib/server/db/profiles";
import { listTimeLogsForWeek } from "@/lib/server/db/timeLogs";
import { getLatestRoadmapForUser } from "@/lib/server/db/roadmaps";
import { inspectPublicRepo } from "@/lib/server/study/github";
import { generateStudyCard, writeCorrection } from "@/lib/server/study/generateCard";
import { readResourceMarkdown } from "@/lib/server/study/jina";
import { runSnippet } from "@/lib/server/study/judge0";
import { refreshRoadmapMarket } from "@/lib/server/study/refreshMarket";
import { chooseStudyMode } from "@/lib/study/chooseMode";
import { matchDeliverables } from "@/lib/study/marketMatch";
import { emptySchedule, scheduleAfterRating } from "@/lib/study/schedule";
import type { StudyCardResult } from "@/lib/study/types";
import { getDefaultWeekStartDetroit, getWeekEndFromStart } from "@/lib/weekStart";

const PRO_MESSAGE = "Today's study card is part of Pro.";

async function requireProStudy(stepId: string) {
  const { userId } = await requireUserAndProfile();
  const entitlements = await getEntitlements(userId);
  if (!entitlements.isPro) {
    return { ok: false as const, error: PRO_MESSAGE };
  }
  const step = await getOwnedStep(userId, stepId);
  if (!step) return { ok: false as const, error: "Step not found" };
  return { ok: true as const, userId, step };
}

async function loggedHoursThisWeek(userId: string): Promise<number> {
  const weekStart = getDefaultWeekStartDetroit();
  const logs = await listTimeLogsForWeek(userId, weekStart, getWeekEndFromStart(weekStart));
  return logs.reduce((sum, log) => sum + log.minutes, 0) / 60;
}

function displayFor(card: { reps: number; due: string }, preference: string | null, logged: number, weekly: number) {
  return chooseStudyMode({
    weeklyHours: weekly,
    loggedHours: logged,
    learningPreference: preference,
    reps: card.reps,
    due: new Date(card.due),
  });
}

export async function loadStudyCard(stepId: string): Promise<StudyCardResult> {
  const parsed = z.string().uuid().safeParse(stepId);
  if (!parsed.success) return { ok: false, error: "Invalid step" };
  const access = await requireProStudy(parsed.data);
  if (!access.ok) return access;

  const [card, profile, logged] = await Promise.all([
    getStudyCard(access.userId, access.step.id),
    getProfileForRoadmapEdit(access.userId),
    loggedHoursThisWeek(access.userId),
  ]);
  const weekly = profile?.weekly_hours ?? 0;
  if (
    chooseStudyMode({
      weeklyHours: weekly,
      loggedHours: logged,
      learningPreference: profile?.learning_preference ?? null,
      reps: card?.reps ?? 0,
      due: card ? new Date(card.due) : null,
    }) === "rest"
  ) {
    return {
      ok: true,
      kind: "rest",
      message: "You already hit this week's hours. Rest, then come back for the next question.",
    };
  }
  if (!card) return { ok: true, kind: "empty" };
  const mode = displayFor(card, profile?.learning_preference ?? null, logged, weekly);
  return { ok: true, kind: "card", card: toStudyCardView(card, mode === "rest" ? "recall" : mode) };
}

export async function prepareStudyCard(stepId: string): Promise<StudyCardResult> {
  const loaded = await loadStudyCard(stepId);
  if (!loaded.ok || loaded.kind !== "empty") return loaded;

  const access = await requireProStudy(stepId);
  if (!access.ok) return access;
  const recent = await countRecentStudyCards(access.userId);
  if (recent >= 8) {
    return { ok: false, error: "You prepared several cards this hour. Use the one you have, then try again." };
  }

  const profile = await getProfileForRoadmapEdit(access.userId);
  const mode = chooseStudyMode({
    weeklyHours: profile?.weekly_hours ?? 0,
    loggedHours: 0,
    learningPreference: profile?.learning_preference ?? null,
    reps: 0,
    due: null,
  });
  if (mode === "rest") {
    return {
      ok: true,
      kind: "rest",
      message: "You already hit this week's hours. Rest, then come back for the next question.",
    };
  }

  const excerpt = access.step.resourceUrl
    ? await readResourceMarkdown(access.step.resourceUrl)
    : null;
  const generated = await generateStudyCard({
    mode,
    title: access.step.title,
    description: access.step.description,
    resourceTitle: access.step.resourceTitle,
    pageExcerpt: excerpt,
  });
  const row = await insertStudyCard({
    userId: access.userId,
    stepId: access.step.id,
    mode,
    example: generated.example,
    tryThis: generated.try_this,
    question: generated.question,
    focus: generated.focus,
    resourceUrl: access.step.resourceUrl,
    resourceTitle: access.step.resourceTitle,
    schedule: emptySchedule(),
  });
  if (!row) {
    return {
      ok: false,
      error: "Could not save today's card. Apply migration 00023_study_loop if the study tables are missing.",
    };
  }
  revalidatePath("/dashboard");
  revalidatePath("/roadmap");
  return { ok: true, kind: "card", card: toStudyCardView(row, mode) };
}

const reviewSchema = z.object({
  stepId: z.string().uuid(),
  cardId: z.string().uuid(),
  answer: z.string().trim().min(1).max(2000),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

export async function submitStudyReview(input: {
  stepId: string;
  cardId: string;
  answer: string;
  rating: number;
}): Promise<StudyCardResult> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Write an answer, then pick how hard it was." };
  const access = await requireProStudy(parsed.data.stepId);
  if (!access.ok) return access;
  const card = await getStudyCard(access.userId, access.step.id);
  if (!card || card.id !== parsed.data.cardId) return { ok: false, error: "Study card not found" };

  const correction = await writeCorrection({
    question: card.question,
    answer: parsed.data.answer,
    checkSummary: card.check_summary,
  });
  const schedule = scheduleAfterRating(card, parsed.data.rating);
  const saved = await saveStudyReview({
    userId: access.userId,
    cardId: card.id,
    answer: parsed.data.answer,
    rating: parsed.data.rating,
    correction,
    schedule,
  });
  if (!saved) return { ok: false, error: "Could not save that review." };
  const updated = await getStudyCard(access.userId, access.step.id);
  if (!updated) return { ok: false, error: "Could not reload the card." };
  revalidatePath("/dashboard");
  return { ok: true, kind: "card", card: toStudyCardView(updated, "example") };
}

const codeSchema = z.object({
  stepId: z.string().uuid(),
  cardId: z.string().uuid(),
  language: z.enum(["javascript", "python"]),
  source: z.string().trim().min(1).max(8000),
});

export async function checkStudyCode(input: {
  stepId: string;
  cardId: string;
  language: "javascript" | "python";
  source: string;
}): Promise<StudyCardResult> {
  const parsed = codeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Add a short JavaScript or Python snippet." };
  const access = await requireProStudy(parsed.data.stepId);
  if (!access.ok) return access;
  const card = await getStudyCard(access.userId, access.step.id);
  if (!card || card.id !== parsed.data.cardId) return { ok: false, error: "Study card not found" };

  const run = await runSnippet(parsed.data.source, parsed.data.language);
  if (!run.ok) return { ok: false, error: run.error };
  const summary = [
    `Runner: ${run.status}.`,
    run.stdout ? `Output: ${run.stdout}` : "",
    run.stderr ? `Error: ${run.stderr}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 1500);
  const saved = await saveCheckSummary({
    userId: access.userId,
    cardId: card.id,
    kind: "code",
    summary,
  });
  if (!saved) return { ok: false, error: "Could not save the code check." };
  const updated = await getStudyCard(access.userId, access.step.id);
  if (!updated) return { ok: false, error: "Could not reload the card." };
  return { ok: true, kind: "card", card: toStudyCardView(updated, card.mode) };
}

const repoSchema = z.object({
  stepId: z.string().uuid(),
  cardId: z.string().uuid(),
  repoUrl: z.string().trim().url().max(200),
});

function deliverableList(phaseProject: unknown): string[] {
  if (typeof phaseProject !== "object" || phaseProject === null) return [];
  const record = phaseProject as { deliverables?: unknown };
  if (!Array.isArray(record.deliverables)) return [];
  return record.deliverables.filter((item): item is string => typeof item === "string");
}

export async function checkStudyRepo(input: {
  stepId: string;
  cardId: string;
  repoUrl: string;
}): Promise<StudyCardResult> {
  const parsed = repoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Paste a public GitHub repository link." };
  const access = await requireProStudy(parsed.data.stepId);
  if (!access.ok) return access;
  const card = await getStudyCard(access.userId, access.step.id);
  if (!card || card.id !== parsed.data.cardId) return { ok: false, error: "Study card not found" };

  const repo = await inspectPublicRepo(parsed.data.repoUrl);
  if (!repo.ok) return { ok: false, error: repo.error };
  const deliverables = deliverableList(access.step.phaseProject);
  const compared = matchDeliverables(deliverables, repo.files);
  const summary =
    deliverables.length === 0
      ? `Read ${repo.files.length} files in ${repo.owner}/${repo.repo}. This phase has no deliverable list to compare.`
      : `Matched ${compared.matched.length} of ${deliverables.length} deliverables in ${repo.owner}/${repo.repo}. Missing: ${compared.missing.slice(0, 4).join("; ") || "none"}.`;
  const saved = await saveCheckSummary({
    userId: access.userId,
    cardId: card.id,
    kind: "repo",
    summary: summary.slice(0, 1500),
  });
  if (!saved) return { ok: false, error: "Could not save the repository check." };
  const updated = await getStudyCard(access.userId, access.step.id);
  if (!updated) return { ok: false, error: "Could not reload the card." };
  return { ok: true, kind: "card", card: toStudyCardView(updated, card.mode) };
}

export async function refreshRoleMatch(): Promise<
  { ok: true; message: string } | { ok: false; error: string }
> {
  const { userId } = await requireUserAndProfile();
  const entitlements = await getEntitlements(userId);
  if (!entitlements.isPro) {
    return { ok: false, error: "Role match updates are part of Pro." };
  }
  const roadmap = await getLatestRoadmapForUser(userId);
  if (!roadmap) return { ok: false, error: "Create a roadmap first." };
  const result = await refreshRoadmapMarket({
    userId,
    roadmapId: roadmap.id,
    targetRole: roadmap.target_role,
  });
  if (!result.ok) return result;
  revalidatePath("/roadmap");
  const title = result.occupationTitle ? ` (${result.occupationTitle})` : "";
  return {
    ok: true,
    message:
      result.updated === 0
        ? `Role match is current${title}. Later steps still line up with the skills we found.`
        : `Marked ${result.updated} later step${result.updated === 1 ? "" : "s"} optional${title}. Finished steps were left as they are. Occupation data: O*NET.`,
  };
}
