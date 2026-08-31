import "server-only";
import type { NetworkingActionType } from "@/lib/networking/actionTypes";
import type {
  MessageDraft,
  MessageDraftPurpose,
} from "@/lib/networking/draftTypes";
import type {
  NetworkingPreference,
  ProfileNetworkingSettings,
} from "@/lib/server/db/networking";

export type NetworkingGuidance = {
  weekly_focus_title: string;
  weekly_focus_description: string;
  suggested_actions: Array<{
    action_type: NetworkingActionType;
    label: string;
    why_it_matters: string;
  }>;
  /** Copy-ready drafts (prefer these over vague outlines). */
  message_drafts: MessageDraft[];
};

type GuidanceContext = {
  profile: ProfileNetworkingSettings | null;
  targetRole?: string | null;
  currentPhaseIndex: number | null;
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

function draftLimit(pref: NetworkingPreference): number {
  if (pref === "quiet") return 1;
  if (pref === "active") return 3;
  return 2;
}

function roleLabel(targetRole: string | null): string {
  const t = targetRole?.trim();
  return t && t.length > 0 ? t : "this role";
}

function focusBit(phaseTitle: string | null, stepTitle: string | null): string {
  if (stepTitle?.trim()) return stepTitle.trim();
  if (phaseTitle?.trim()) return phaseTitle.trim();
  return "my current learning plan";
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
        "You’ll learn what to focus on from people who recently did it.",
    },
    {
      action_type: "comment_left",
      label: "Leave 1 thoughtful comment on a relevant post",
      why_it_matters: "Small, genuine visibility beats cold outreach volume.",
    },
    {
      action_type: "coffee_chat_requested",
      label: "Ask for a 15‑minute coffee chat (optional)",
      why_it_matters:
        "Short chats create clarity and relationships without pressure.",
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
      label: "Ask 1 person about stacks + expectations at their company",
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
      why_it_matters:
        "Specific, role-aligned outreach gets better responses than generic intros.",
    },
    {
      action_type: "follow_up_sent",
      label: "Send 1 polite follow‑up (3–7 days later)",
      why_it_matters:
        "Follow-ups are normal and often convert silence into a reply.",
    },
    {
      action_type: "coffee_chat_requested",
      label: "Request a short referral‑prep chat (optional)",
      why_it_matters:
        "A quick call can turn “good luck” into actionable internal guidance.",
    },
  ];

  const pool = isJobReadyPhase(params.phaseIndex)
    ? baseJobReady
    : isMidPhase(params.phaseIndex)
      ? baseMid
      : baseEarly;

  return pool.slice(0, preferenceLimit(params.pref));
}

function draft(params: {
  id: string;
  purpose: MessageDraftPurpose;
  action_type: NetworkingActionType;
  channel: MessageDraft["channel"];
  title: string;
  instruction: string;
  subject_line?: string | null;
  body: string;
  personalize_hint: string;
}): MessageDraft {
  return {
    id: params.id,
    purpose: params.purpose,
    action_type: params.action_type,
    channel: params.channel,
    title: params.title,
    instruction: params.instruction,
    subject_line: params.subject_line ?? null,
    body: params.body.trim(),
    personalize_hint: params.personalize_hint,
  };
}

/**
 * Human, professional drafts. Avoid AI tells:
 * "hope this finds you well", "pick your brain", "synergy", "I'd be honored",
 * "excited to connect", long compliments, mentor asks.
 */
function buildMessageDrafts(params: {
  phaseIndex: number;
  targetRole: string | null;
  phaseTitle: string | null;
  stepTitle: string | null;
  pref: NetworkingPreference;
}): MessageDraft[] {
  const role = roleLabel(params.targetRole);
  const focus = focusBit(params.phaseTitle, params.stepTitle);

  const early: MessageDraft[] = [
    draft({
      id: "early-advice-dm",
      purpose: "ask_for_advice",
      action_type: "outreach_sent",
      channel: "linkedin_dm",
      title: "Advice ask (DM)",
      instruction:
        "Send to someone 1–2 years ahead in your target role. Keep under ~80 words. One question only.",
      subject_line: null,
      body: `Hi [Name] — came across your work on [specific post or project]. I'm working toward ${role} and currently focused on ${focus}.

If you have a minute: what would you prioritize in the next month that most people skip?

No worries if you're busy — either way, appreciate your time.`,
      personalize_hint:
        "Replace [Name] and [specific post or project] with something real before sending.",
    }),
    draft({
      id: "early-comment",
      purpose: "thoughtful_comment",
      action_type: "comment_left",
      channel: "comment",
      title: "Thoughtful comment",
      instruction:
        "Comment on a recent post from someone in your space. Add one concrete takeaway — don't just say “great post.”",
      body: `This landed. The part about [one specific point] matches what I've been seeing while working on ${focus}.

Curious how you approached [one practical detail] — that seems like the hard part.`,
      personalize_hint:
        "Fill both brackets from the actual post. Delete the second sentence if you don't have a real question.",
    }),
    draft({
      id: "early-coffee",
      purpose: "request_coffee_chat",
      action_type: "coffee_chat_requested",
      channel: "linkedin_dm",
      title: "15‑min chat ask",
      instruction:
        "Only after they've posted or commented recently, or you share a clear connection. Propose short, optional times.",
      body: `Hi [Name] — I've been following your path into ${role}, especially [specific detail]. I'm currently on ${focus} and trying to make good tradeoffs.

Would you be open to a 15‑minute call sometime in the next couple weeks? Happy to work around your schedule — [two time windows], or whatever works better for you.

Totally fine if not.`,
      personalize_hint:
        "Add a real [specific detail] and two concrete time windows. Don't ask them to “mentor” you.",
    }),
  ];

  const mid: MessageDraft[] = [
    draft({
      id: "mid-progress-post",
      purpose: "progress_post",
      action_type: "post_published",
      channel: "post",
      title: "Progress post",
      instruction:
        "Share one concrete thing you built or learned this week. End with a real question — not a soft CTA.",
      body: `Quick update while working toward ${role}:

This week I [built / fixed / shipped] [specific thing] as part of ${focus}.
What surprised me: [one honest lesson].

If you've done similar work — what would you tighten next?`,
      personalize_hint:
        "Use a real artifact and a real lesson. Skip hashtag spam and “Thrilled to announce.”",
    }),
    draft({
      id: "mid-stack-ask",
      purpose: "ask_for_advice",
      action_type: "outreach_sent",
      channel: "linkedin_dm",
      title: "Stack / expectations ask",
      instruction:
        "Ask one person in the role about day-to-day expectations. Reference something they've shared.",
      body: `Hi [Name] — noticed your note on [topic]. I'm aiming for ${role} and currently deep on ${focus}.

What skills or tools matter most in your week-to-week work that job posts usually undersell?

Appreciate any perspective — and no stress if you can't reply.`,
      personalize_hint:
        "Tie [topic] to a real post or talk. One question only.",
    }),
    draft({
      id: "mid-comment",
      purpose: "thoughtful_comment",
      action_type: "comment_left",
      channel: "comment",
      title: "Role-relevant comment",
      instruction:
        "Comment on a post from someone already in your target role. Be useful, not promotional.",
      body: `Helpful framing on [specific point]. I've been running into the same tradeoff while working on ${focus} — especially around [related detail].

Did you land on a rule of thumb for when to [choice A] vs [choice B]?`,
      personalize_hint:
        "Make every bracket specific to their post. Drop the question if it feels forced.",
    }),
  ];

  const jobReady: MessageDraft[] = [
    draft({
      id: "job-targeted-note",
      purpose: "ask_for_referral",
      action_type: "outreach_sent",
      channel: "linkedin_dm",
      title: "Role + proof outreach",
      instruction:
        "Send only when you have a real job link and two proof points. Ask if a referral is comfortable — don't assume.",
      subject_line: `Quick note on the ${role} role`,
      body: `Hi [Name] — I'm applying to the ${role} role on your team ([job link]) and wanted to reach out briefly.

Recent work that maps to the posting:
• [proof point 1 — stack or outcome]
• [proof point 2 — stack or outcome]

Would you be comfortable referring me, or pointing me to the best next step? Totally understand if you can't.`,
      personalize_hint:
        "Paste the real job link and two proof points you can stand behind. Rewrite any line that doesn't sound like you.",
    }),
    draft({
      id: "job-follow-up",
      purpose: "follow_up",
      action_type: "follow_up_sent",
      channel: "linkedin_dm",
      title: "Polite follow‑up",
      instruction:
        "Send 3–7 days after your first note if there's no reply. Keep it shorter than the original.",
      body: `Hi [Name] — just bumping this in case it got buried. Still interested in the ${role} role ([job link]) and happy to share more context if useful.

No pressure either way — thanks again.`,
      personalize_hint:
        "Only follow up once. Include the same job link. Don't add guilt or urgency.",
    }),
    draft({
      id: "job-referral-chat",
      purpose: "request_coffee_chat",
      action_type: "coffee_chat_requested",
      channel: "linkedin_dm",
      title: "Referral‑prep chat",
      instruction:
        "Use when someone is open to talking but not ready to refer cold. Keep the ask about their team’s bar, not a hard ask for a yes.",
      body: `Hi [Name] — thanks again for being open to a quick chat. I'm preparing for ${role} interviews and specifically curious how your team evaluates [one skill area].

Would 15 minutes this week or next work? I can share a short agenda ahead of time so it's easy to say no if timing's off.`,
      personalize_hint:
        "Name one skill area that matches the job. Offer an agenda; keep it optional.",
    }),
  ];

  const pool = isJobReadyPhase(params.phaseIndex)
    ? jobReady
    : isMidPhase(params.phaseIndex)
      ? mid
      : early;

  return pool.slice(0, draftLimit(params.pref));
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
  const message_drafts = buildMessageDrafts({
    phaseIndex,
    targetRole: ctx.targetRole ?? null,
    phaseTitle: ctx.currentPhaseTitle ?? null,
    stepTitle: ctx.currentStepTitle ?? null,
    pref,
  });

  return {
    ...weeklyFocus,
    suggested_actions,
    message_drafts,
  };
}

/** Prefer draft matching the recommended action; else first draft. */
export function getPrimaryDraft(
  guidance: NetworkingGuidance
): MessageDraft | null {
  const recommended = guidance.suggested_actions[0];
  if (!recommended) return guidance.message_drafts[0] ?? null;
  return (
    guidance.message_drafts.find(
      (d) => d.action_type === recommended.action_type
    ) ??
    guidance.message_drafts[0] ??
    null
  );
}
