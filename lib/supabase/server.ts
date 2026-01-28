import "server-only";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/server/env";

export async function createClient() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey } =
    getEnv();

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options ?? {})
          );
        } catch {
          // Read-only in Server Component when middleware handles session refresh
        }
      },
    },
  });
}

/**
 * Service-role client for server-only writes (e.g. webhooks).
 * Bypasses RLS. Never expose to the client.
 */
export function createServiceRoleClient() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } =
    getEnv();
  return createSupabaseClient(url, key);
}
