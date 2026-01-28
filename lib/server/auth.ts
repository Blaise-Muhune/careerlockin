import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState =
  | { user: { id: string }; profile: { id: string } | null }
  | { user: null; profile: null };

/**
 * Returns the current user and profile (if any). Does not redirect.
 * Use this in layout/page when you need to branch on auth state.
 */
export async function getAuthState(): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id },
    profile: profile ? { id: profile.id } : null,
  };
}

/**
 * Requires a logged-in user. Redirects to /login if not authenticated.
 * Returns user id only; does not check profile.
 */
export async function requireUser(): Promise<{ id: string }> {
  const state = await getAuthState();
  if (!state.user) {
    redirect("/login");
  }
  return state.user;
}

/**
 * Requires a logged-in user and a profile. Redirects to /login if not
 * authenticated, or to /onboarding if no profile. Use in (app) routes
 * that are not /onboarding.
 */
export async function requireUserAndProfile(): Promise<{
  userId: string;
  profileId: string;
}> {
  const state = await getAuthState();
  if (!state.user) {
    redirect("/login");
  }
  if (!state.profile) {
    redirect("/onboarding");
  }
  return {
    userId: state.user.id,
    profileId: state.profile.id,
  };
}

/**
 * Requires a logged-in user. If profile exists, redirects to /dashboard.
 * Use on /onboarding so users who already completed it go to dashboard.
 */
export async function requireUserForOnboarding(): Promise<{ id: string }> {
  const state = await getAuthState();
  if (!state.user) {
    redirect("/login");
  }
  if (state.profile) {
    redirect("/dashboard");
  }
  return state.user;
}
