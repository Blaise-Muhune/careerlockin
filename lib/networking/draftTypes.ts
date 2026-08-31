/** Shared networking draft types (client + server safe). */

import type { NetworkingActionType } from "@/lib/networking/actionTypes";

export const MESSAGE_DRAFT_CHANNELS = [
  "linkedin_dm",
  "connection_note",
  "comment",
  "post",
] as const;

export type MessageDraftChannel = (typeof MESSAGE_DRAFT_CHANNELS)[number];

export const MESSAGE_DRAFT_PURPOSES = [
  "ask_for_advice",
  "ask_for_referral",
  "request_coffee_chat",
  "follow_up",
  "progress_post",
  "thoughtful_comment",
] as const;

export type MessageDraftPurpose = (typeof MESSAGE_DRAFT_PURPOSES)[number];

export type MessageDraft = {
  /** Stable key for React / copy feedback. */
  id: string;
  purpose: MessageDraftPurpose;
  /** Matches logging checkbox vocabulary. */
  action_type: NetworkingActionType;
  channel: MessageDraftChannel;
  /** Short UI label. */
  title: string;
  /** Who / when / how — 1–2 sentences. */
  instruction: string;
  /** Optional subject (email / InMail). Null for DMs/posts. */
  subject_line: string | null;
  /** Ready-to-send body. User fills [brackets] only. */
  body: string;
  /** One-line reminder before send. */
  personalize_hint: string;
};

export const CHANNEL_LABELS: Record<MessageDraftChannel, string> = {
  linkedin_dm: "LinkedIn DM",
  connection_note: "Connection note",
  comment: "Comment",
  post: "Post",
};
