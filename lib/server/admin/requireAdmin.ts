import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin access: database flag only.
 * Set profiles.is_admin = true via Supabase SQL or service role. No UI to change it.
 *
 * Requires a logged-in user with profiles.is_admin = true.
 * Redirects to /login if not authenticated, to /dashboard if not admin.
 * Returns { userId } for use in the admin layout/page.
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
