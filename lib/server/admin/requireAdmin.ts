import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowlistedAdminEmail } from "@/lib/server/admin/adminAllowlist";

/**
 * Returns whether the user has admin access. Use for conditional UI (e.g. nav link).
 */
export async function getIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user || user.id !== userId) {
    return false;
  }

  if (isAllowlistedAdminEmail(user.email)) {
    return true;
  }

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.is_admin === true;
}

/**
 * Admin access: allowlisted founder emails or profiles.is_admin.
 * Requires a logged-in user. Redirects to /login if not authenticated,
 * to /dashboard if not admin.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  if (isAllowlistedAdminEmail(user.email)) {
    return { userId: user.id };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return { userId: user.id };
}
