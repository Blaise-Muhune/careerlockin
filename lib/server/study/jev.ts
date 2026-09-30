import "server-only";
import { z } from "zod";
import { getEnv } from "@/lib/server/env";
import type { StudyMode } from "@/lib/study/chooseMode";
import { applyJevChoice } from "@/lib/study/jevMode";

const MODEL = "typesafe/jev-1.13";
const DECISIONS_URL = "https://openrouter.ai/api/alpha/decisions";

const choiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  confidence: z.number(),
});

const responseSchema = z.object({
  answers: z.object({
    mode: choiceAnswerSchema,
  }),
});

export async function chooseStudyModeWithJev(input: {
  rule: StudyMode;
  title: string;
  description: string;
  learningPreference: string | null;
  weeklyHours: number;
  loggedHours: number;
}): Promise<StudyMode> {
  if (input.rule === "rest" || input.rule === "recall") return input.rule;
  const apiKey = getEnv().OPENROUTER_API_KEY;
  if (!apiKey) return input.rule;

  try {
    const response = await fetch(DECISIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        state: {
          step_title: input.title,
          step_description: input.description.slice(0, 1200),
          learning_preference: input.learningPreference ?? "unknown",
          weekly_hours: input.weeklyHours,
          logged_hours_this_week: input.loggedHours,
        },
        questions: {
          mode: {
            type: "choice",
            instructions:
              "Which study card should this person get for this step right now?",
            criteria: {
              example:
                "They should see one worked example and then try a small piece. Use this for reading, video, mixed, or when the step is still unfamiliar.",
              build:
                "They should make something. Use this when they prefer projects or the step is already a hands-on task.",
            },
          },
        },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return input.rule;
    const parsed = responseSchema.safeParse(await response.json());
    if (!parsed.success) return input.rule;
    return applyJevChoice(
      input.rule,
      parsed.data.answers.mode.choice,
      parsed.data.answers.mode.confidence
    );
  } catch {
    return input.rule;
  }
}
