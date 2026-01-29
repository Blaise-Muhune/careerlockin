import "server-only";
import { z } from "zod";

/**
 * Strict JSON schema for AI-generated roadmap output.
 * Rules: 3–5 phases, 4–7 steps per phase, 1–2 resources per step.
 * No extra keys (enforced via .strict()).
 */

const resourceTypeEnum = z.enum(["video", "course", "playlist", "certificate"]);
const verificationStatusEnum = z.enum(["verified", "unverified"]);

const phaseProjectSchema = z
  .object({
    title: z.string().min(1),
    short_description: z.string().min(1),
    goal: z.string().min(1),
    deliverables: z.array(z.string().min(1)).min(3).max(5),
    estimated_time_hours: z.number(),
    is_optional: z.boolean(),
  })
  .strict();

const practiceTypeEnum = z.enum(["project", "challenge"]);
const practiceDifficultyEnum = z.enum(["easy", "medium", "hard"]);
const stepPracticeSchema = z
  .object({
    type: practiceTypeEnum,
    title: z.string().min(1),
    description: z.string().min(1),
    purpose: z.string().min(1),
    difficulty: practiceDifficultyEnum,
    is_optional: z.boolean(),
  })
  .strict();

const resourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().min(1),
    publisher: z.string().min(1),
    resource_type: resourceTypeEnum,
    is_free: z.boolean(),
    source_id: z.string(),
    // Structured outputs require all fields to be "required"; to allow absence, use a union with null.
    // The model may emit `null` for these and we'll overwrite them during post-processing.
    verification_status: z.union([verificationStatusEnum, z.null()]),
  })
  .strict();

const stepSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    est_hours: z.number(),
    step_order: z.number().int().positive(),
    resources: z.array(resourceSchema).min(0).max(2), // Allow 0 resources if none are valid/grounded
    // Optional practices: keep this nullable to satisfy Structured Outputs requirements.
    // Max 0–2 practices; if none, model should output [].
    practices: z.array(stepPracticeSchema).min(0).max(2),
  })
  .strict();

const phaseSchema = z
  .object({
    phase_title: z.string().min(1),
    phase_order: z.number().int().positive(),
    // Exactly one meaningful, phase-aligned project.
    phase_project: phaseProjectSchema,
    steps: z.array(stepSchema).min(4).max(7),
  })
  .strict();

export const roadmapJsonSchema = z
  .object({
    target_role: z.string().min(1),
    assumptions: z
      .object({
        weekly_hours: z.number().int().min(1).max(60),
        current_level: z.string(),
        time_horizon_weeks: z.number().int().min(1).max(104),
      })
      .strict(),
    phases: z.array(phaseSchema).min(3).max(5),
  })
  .strict();

export type RoadmapJson = z.infer<typeof roadmapJsonSchema>;
export type RoadmapPhase = RoadmapJson["phases"][number];
export type RoadmapStep = RoadmapPhase["steps"][number];
export type RoadmapResource = RoadmapStep["resources"][number];
export type RoadmapPhaseProject = RoadmapPhase["phase_project"];
export type RoadmapStepPractice = RoadmapStep["practices"][number];
