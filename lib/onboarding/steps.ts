import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Clock,
  GraduationCap,
  Map,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";

export type OnboardingStepId = "role" | "goals" | "about" | "account";

export type OnboardingStepMeta = {
  id: OnboardingStepId;
  label: string;
  title: string;
  lead: string;
  icon: LucideIcon;
};

export const GUEST_STEPS: OnboardingStepMeta[] = [
  {
    id: "role",
    label: "Role",
    title: "What role are you aiming for?",
    lead: "We scope phases, steps, and resources around this. Account creation is the last step — right before your roadmap.",
    icon: Map,
  },
  {
    id: "goals",
    label: "Goals",
    title: "How much time can you invest?",
    lead: "Your weekly hours shape realistic time estimates in every phase.",
    icon: Clock,
  },
  {
    id: "about",
    label: "You",
    title: "Optional details",
    lead: "Skip anything you're unsure about. You can refine this later in Settings.",
    icon: UserRound,
  },
  {
    id: "account",
    label: "Account",
    title: "Save your profile",
    lead: "Create an account to generate Phase 1 free. No card required.",
    icon: Sparkles,
  },
];

export const AUTHED_STEPS: OnboardingStepMeta[] = GUEST_STEPS.slice(0, 3);

export const GOAL_OPTIONS = [
  { value: "job" as const, label: "Land a job", icon: Briefcase },
  { value: "internship" as const, label: "Internship", icon: GraduationCap },
  { value: "career_switch" as const, label: "Career switch", icon: RefreshCw },
  { value: "skill_upgrade" as const, label: "Skill upgrade", icon: TrendingUp },
];

export const WEEKLY_HOUR_PRESETS = [5, 10, 15, 20, 30] as const;

export const LEARNING_LABELS: Record<
  "reading" | "video" | "project_first" | "mixed",
  string
> = {
  reading: "Reading",
  video: "Video",
  project_first: "Projects first",
  mixed: "Mixed",
};
