"use client";

import {
  defaultOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding/schema";

export const ONBOARDING_DRAFT_KEY = "careerlockin_onboarding_draft";
export const ONBOARDING_OAUTH_PENDING_KEY = "careerlockin_onboarding_oauth_pending";

export function readOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (!parsed || typeof parsed.target_role !== "string") return null;
    return { ...defaultOnboardingDraft(), ...parsed };
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
  sessionStorage.removeItem(ONBOARDING_OAUTH_PENDING_KEY);
}

export function markOnboardingOAuthPending(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ONBOARDING_OAUTH_PENDING_KEY, "1");
}

export function isOnboardingOAuthPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ONBOARDING_OAUTH_PENDING_KEY) === "1";
}
