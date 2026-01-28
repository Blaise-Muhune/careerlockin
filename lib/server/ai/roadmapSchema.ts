import "server-only";
import { z } from "zod";

/**
 * Strict JSON schema for AI-generated roadmap output.
 * Rules: 3–5 phases, 4–7 steps per phase, 1–2 resources per step.
 * No extra keys (enforced via .strict()).
 */

const resourceTypeEnum = z.enum(["docs", "article", "video", "course"]);
const verificationStatusEnum = z.enum(["verified", "unverified", "fallback"]);

const resourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().min(1),
    publisher: z.string().min(1),
    resource_type: resourceTypeEnum,
    is_free: z.boolean(),
    source_id: z.string(),
    verification_status: verificationStatusEnum.optional(),
    is_fallback: z.boolean().optional(),
  })
  .strict();

const stepSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    est_hours: z.number(),
    step_order: z.number().int().positive(),
    resources: z.array(resourceSchema).min(1).max(2),
  })
  .strict();

const phaseSchema = z
  .object({
    phase_title: z.string().min(1),
    phase_order: z.number().int().positive(),
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
