/**
 * Verify allowlisted admin emails in production DB.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_ALLOWLIST_EMAILS } from "../lib/server/admin/adminAllowlist";

function loadEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    out[trimmed.slice(0, i)] = trimmed.slice(i + 1).replace(/^["']|["']$/g, "");
  }
  return out;
}

function getEnv(): Record<string, string> {
  const local = loadEnvFile(resolve(process.cwd(), ".env.local"));
  return { ...local, ...process.env } as Record<string, string>;
}

async function main() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log(`Verifying project: ${projectRef ?? url}\n`);

  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) throw error;

  for (const email of ADMIN_ALLOWLIST_EMAILS) {
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) {
      console.log(`${email}: not signed up (app allowlist will grant /admin once they sign in)`);
      continue;
    }
    const { data: profile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      console.log(`${email}: signed up, no profile (app allowlist grants /admin access now)`);
      continue;
    }
    console.log(`${email}: profiles.is_admin=${profile.is_admin === true}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
