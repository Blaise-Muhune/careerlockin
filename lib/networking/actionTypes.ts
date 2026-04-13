/** Shared networking action vocabulary (safe for client + server). */

export const NETWORKING_ACTION_TYPES = [
  "outreach_sent",
  "follow_up_sent",
  "comment_left",
  "post_published",
  "coffee_chat_requested",
] as const;

export type NetworkingActionType = (typeof NETWORKING_ACTION_TYPES)[number];
