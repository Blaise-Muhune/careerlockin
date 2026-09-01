import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { isAllowlistedAdminEmail } from "@/lib/server/admin/adminAllowlist";

/**
 * Ensures allowlisted founder emails have profiles.is_admin=true.
 * Uses service role so it works even when the DB trigger migration is not applied yet.
 */
export async function grantAllowlistedAdminIfNeeded(
  userId: string,
  email: string | null | undefined
): Promise<void> {
  if (!isAllowlistedAdminEmail(email)) {
    return;
  }

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("profiles")
    .update({ is_admin: true })
    .eq("user_id", userId);

  if (error) {
    console.error("[admin] failed to grant allowlisted admin:", error.message);
  }
}
