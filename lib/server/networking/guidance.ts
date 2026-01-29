import "server-only";
import type {
  NetworkingActionType,
  NetworkingPreference,
  ProfileNetworkingSettings,
} from "@/lib/server/db/networking";

export type MessageOutlinePurpose =
  | "ask_for_advice"
  | "ask_for_referral"
  | "request_coffee_chat";

export type NetworkingGuidance = {
  weekly_focus_title: string;
  weekly_focus_description: string; // 1 sentence
  suggested_actions: Array<{
    action_type: NetworkingActionType;
    label: string;
    why_it_matters: string; // 1 sentence
  }>;
  message_outlines: Array<{
    purpose: MessageOutlinePurpose;
    subject_line: string;
    outline_points: string[]; // 3–5
    personalization_required_note: string; // 1 line
  }>;
};

type GuidanceContext = {
  profile: ProfileNetworkingSettings | null;
  targetRole?: string | null;
  currentPhaseIndex: number | null; // 0-based
  currentPhaseTitle?: string | null;
  currentStepTitle?: string | null;
};

function isJobReadyPhase(phaseIndex: number): boolean {
  return phaseIndex >= 2;
}

function isMidPhase(phaseIndex: number): boolean {
  return phaseIndex === 1;
}

function preferenceLimit(pref: NetworkingPreference): number {
  if (pref === "quiet") return 1;
  if (pref === "active") return 3;
  return 2;
}

function pickSuggestedActions(params: {
  phaseIndex: number;
  pref: NetworkingPreference;
}): NetworkingGuidance["suggested_actions"] {
  const baseEarly: NetworkingGuidance["suggested_actions"] = [
    {
      action_type: "outreach_sent",
      label: "Send 1 advice request to someone 1–2 years ahead",
      why_it_matters:
        "You’ll learn what to focus on (and what to ignore) from people who recently did it.",
    },
    {
      action_type: "comment_left",
      label: "Leave 1 thoughtful comment on a relevant post",
      why_it_matters: "Small, genuine visibility beats cold outreach volume.",
    },
    {
      action_type: "coffee_chat_requested",
      label: "Ask for a 15‑minute coffee chat (optional)",
      why_it_matters: "Short chats create clarity and relationships without pressure.",
    },
  ];

  const baseMid: NetworkingGuidance["suggested_actions"] = [
    {
      action_type: "post_published",
      label: "Share a small project progress update (optional)",
      why_it_matters:
        "Progress updates make your work legible and create warm inbound conversations.",
    },
    {
      action_type: "outreach_sent",
      label: "Ask 1 engineer about stacks + expectations at their company",
      why_it_matters:
        "You’ll map your roadmap to real hiring expectations instead of guessing.",
    },
    {
      action_type: "comment_left",
      label: "Comment on 1 post from someone in your target role",
      why_it_matters: "It builds familiarity before you ever ask for anything.",
    },
  ];

  const baseJobReady: NetworkingGuidance["suggested_actions"] = [
    {
      action_type: "outreach_sent",
      label: "Send 1 targeted note about a role + your relevant project",
      why_it_matters: "Specific, role-aligned outreach gets better responses than generic intros.",
    },
    {
      action_type: "follow_up_sent",
      label: "Send 1 polite follow‑up (3–7 days later)",
      why_it_matters: "Follow-ups are normal and often convert silence into a reply.",
    },
    {
      action_type: "coffee_chat_requested",
      label: "Request a short referral‑prep chat (optional)",
      why_it_matters: "A quick call can turn “good luck” into actionable internal guidance.",
    },
  ];

  const pool = isJobReadyPhase(params.phaseIndex)
    ? baseJobReady
    : isMidPhase(params.phaseIndex)
      ? baseMid
      : baseEarly;

  return pool.slice(0, preferenceLimit(params.pref));
}

function buildMessageOutlines(params: {
  phaseIndex: number;
  targetRole: string | null;
  phaseTitle: string | null;
  stepTitle: string | null;
  pref: NetworkingPreference;
}): NetworkingGuidance["message_outlines"] {
  const focusContext = [
    params.phaseTitle ? `Phase: ${params.phaseTitle}` : null,
    params.stepTitle ? `Current focus: ${params.stepTitle}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const role = params.targetRole?.trim() || "my target role";

  const early: NetworkingGuidance["message_outlines"] = [
    {
      purpose: "ask_for_advice",
      subject_line: `Quick question about getting into ${role}`,
      outline_points: [
        "1 line: why you’re reaching out (specific reason you picked them).",
        `1 line: what you’re working on right now (${focusContext || "your current learning plan"}).`,
        "Ask 1 focused question (e.g., what to prioritize in the next 4–6 weeks).",
        "Offer an easy out + thank them.",
      ],
      personalization_required_note:
        "Add a real detail (their project, post, or company) before sending.",
    },
    {
      purpose: "request_coffee_chat",
      subject_line: "Would you be open to a 15‑minute chat?",
      outline_points: [
        "1 line: context + why them.",
        "1 line: what you’re aiming for (role + timeline).",
        "Ask for 15 minutes, propose 2 time windows.",
        "Close with gratitude + easy out.",
      ],
      personalization_required_note:
        "Keep it short and specific; don’t ask them to “mentor” you.",
    },
  ];

  const mid: NetworkingGuidance["message_outlines"] = [
    {
      purpose: "ask_for_advice",
      subject_line: `What would you expect from a junior ${role}?`,
      outline_points: [
        "1 line: what you’ve built recently (1 concrete artifact).",
        "Ask what skills/tools matter most in their day-to-day.",
        "Ask what signals they look for in candidates.",
        "Thank them + easy out.",
      ],
      personalization_required_note:
        "Mention a real artifact (repo, demo, or screenshot) and keep it 1–2 lines.",
    },
    {
      purpose: "request_coffee_chat",
      subject_line: "Could I get 15 minutes of perspective?",
      outline_points: [
        "1 line: why them + why now.",
        "2 bullets: what you’re focusing on + what you’re trying to learn.",
        "Ask for 15 minutes, suggest times.",
        "Thank them + easy out.",
      ],
      personalization_required_note:
        "Make the ask small; respect their time and don’t over-explain.",
    },
  ];

  const jobReady: NetworkingGuidance["message_outlines"] = [
    {
      purpose: "ask_for_referral",
      subject_line: `Referral question for a ${role} role (short)`,
      outline_points: [
        "1 line: which role you’re applying to (include job title + link).",
        "2 bullets: 2 role-aligned proof points (project impact, stack, results).",
        "1 sentence: why you’re a fit for this specific team/company.",
        "Ask: would they be comfortable referring you? (easy out)",
      ],
      personalization_required_note:
        "Rewrite in your own words and include a specific job link + 2 real proof points.",
    },
    {
      purpose: "ask_for_advice",
      subject_line: `Quick question about your team’s hiring bar`,
      outline_points: [
        "1 line: why them + connection point.",
        "Ask what the team values most in interviews for this role.",
        "Ask one question about the stack/process (keep it specific).",
        "Thank them + easy out.",
      ],
      personalization_required_note:
        "Avoid generic ‘any advice?’—ask one precise question you truly care about.",
    },
  ];

  const pool = isJobReadyPhase(params.phaseIndex)
    ? jobReady
    : isMidPhase(params.phaseIndex)
      ? mid
      : early;

  // Quiet preference: fewer outlines (still useful)
  return params.pref === "quiet" ? pool.slice(0, 1) : pool.slice(0, 2);
}

export function getNetworkingGuidance(ctx: GuidanceContext): NetworkingGuidance {
  const phaseIndex = Math.max(0, ctx.currentPhaseIndex ?? 0);
  const pref: NetworkingPreference =
    ctx.profile?.networking_preference ?? "balanced";

  const weeklyFocus = isJobReadyPhase(phaseIndex)
    ? {
        weekly_focus_title: "Targeted outreach (quality over volume)",
        weekly_focus_description:
          "Send one specific message tied to a real role and a real proof point.",
      }
    : isMidPhase(phaseIndex)
      ? {
          weekly_focus_title: "Warm visibility + focused questions",
          weekly_focus_description:
            "Share progress or ask a specific question that improves your roadmap.",
        }
      : {
          weekly_focus_title: "Advice-first networking",
          weekly_focus_description:
            "Build relationships by asking for perspective, not opportunities.",
        };

  const suggested_actions = pickSuggestedActions({ phaseIndex, pref });
  const message_outlines = buildMessageOutlines({
    phaseIndex,
    targetRole: ctx.targetRole ?? null,
    phaseTitle: ctx.currentPhaseTitle ?? null,
    stepTitle: ctx.currentStepTitle ?? null,
    pref,
  });

  return {
    ...weeklyFocus,
    suggested_actions,
    message_outlines,
  };
}

