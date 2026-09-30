import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { getEnv } from "@/lib/server/env";
import type { StudyMode } from "@/lib/study/chooseMode";
import { fallbackLessonSteps, lessonStepsFromModel } from "@/lib/study/lessonSteps";

const cardSchema = z
  .object({
    steps: z.array(z.string().min(1).max(240)).min(3).max(5),
    try_this: z.string().min(1).max(400),
    question: z.string().min(1).max(300),
    focus: z.string().min(1).max(400),
  })
  .strict();

const correctionSchema = z
  .object({
    correction: z.string().min(1).max(500),
  })
  .strict();

export type GeneratedStudyCard = {
  steps: string[];
  example: string;
  try_this: string;
  question: string;
  focus: string;
};

function asCard(input: {
  steps: string[];
  try_this: string;
  question: string;
  focus: string;
}): GeneratedStudyCard {
  return { ...input, example: input.steps.join(" ") };
}

export function fallbackStudyCard(input: {
  title: string;
  description: string;
  resourceTitle: string | null;
}): GeneratedStudyCard {
  return asCard({
    steps: fallbackLessonSteps(input.title, input.description),
    try_this: `Spend 25 minutes on one small piece of “${input.title}”.`,
    question: `Without looking, what is the main idea of “${input.title}”?`,
    focus: input.resourceTitle
      ? `Start with ${input.resourceTitle}. Use the part that matches this step and skip the rest.`
      : "Use the step description. Skip anything that is not needed for the small task.",
  });
}

export async function generateStudyCard(input: {
  mode: Exclude<StudyMode, "rest">;
  title: string;
  description: string;
  resourceTitle: string | null;
  pageExcerpt: string | null;
}): Promise<GeneratedStudyCard> {
  const fallback = fallbackStudyCard(input);
  const apiKey = getEnv().OPENAI_API_KEY;
  if (!apiKey) return fallback;

  const openai = new OpenAI({ apiKey });
  const excerpt = input.pageExcerpt?.slice(0, 4000) ?? "";
  try {
    const response = await openai.responses.parse({
      model: "gpt-4.1",
      instructions: [
        "Write a short study card for one career-roadmap step.",
        "steps: 3 to 5 ordered sentences of one worked example. Each sentence is one move, under 200 characters, and follows the previous sentence. Do not number them.",
        "try_this: one task that takes about 25 minutes.",
        "question: one question they must answer from memory, with no multiple choice.",
        "focus: which part of the source to use, and what to skip.",
        "Do not invent a URL. Do not add extra tasks.",
      ].join(" "),
      input: [
        `Mode: ${input.mode}`,
        `Step: ${input.title}`,
        `Description: ${input.description}`,
        input.resourceTitle ? `Source title: ${input.resourceTitle}` : "",
        excerpt ? `Source excerpt:\n${excerpt}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      text: { format: zodTextFormat(cardSchema, "study_card") },
      temperature: 0.3,
      max_output_tokens: 900,
    });
    const parsed = response.output_parsed;
    if (!parsed) return fallback;
    const steps = lessonStepsFromModel(parsed.steps);
    if (steps.length < 3) return fallback;
    return asCard({ ...parsed, steps });
  } catch {
    return fallback;
  }
}

export async function writeCorrection(input: {
  question: string;
  answer: string;
  checkSummary: string | null;
}): Promise<string> {
  const fallback = input.checkSummary
    ? input.checkSummary
    : "Saved. The next review date is on the card.";
  const apiKey = getEnv().OPENAI_API_KEY;
  if (!apiKey) return fallback;

  const openai = new OpenAI({ apiKey });
  try {
    const response = await openai.responses.parse({
      model: "gpt-4.1",
      instructions:
        "In at most 3 sentences, say what was right and the one gap. Do not rewrite the lesson.",
      input: [
        `Question: ${input.question}`,
        `Answer: ${input.answer}`,
        input.checkSummary ? `Check: ${input.checkSummary}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      text: { format: zodTextFormat(correctionSchema, "correction") },
      temperature: 0.2,
      max_output_tokens: 250,
    });
    return response.output_parsed?.correction ?? fallback;
  } catch {
    return fallback;
  }
}
