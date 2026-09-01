/**
 * Production admin setup:
 * 1. Grants profiles.is_admin for allowlisted emails that already have profiles.
 * 2. Reminds you to run migration 00022 in Supabase SQL Editor (one-time DDL).
 *
 * Usage (local): pnpm admin:apply
 * Usage (prod):  set env vars then `pnpm admin:apply`
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

async function grantExistingAdmins(
  url: string,
  serviceRoleKey: string
): Promise<{ updated: string[]; skippedNoProfile: string[]; notSignedUp: string[]; errors: string[] }> {
  const admin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const allowSet = new Set(ADMIN_ALLOWLIST_EMAILS.map((e) => e.toLowerCase()));
  const userIdsByEmail = new Map<string, string>();

  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    for (const user of data.users) {
      const email = user.email?.toLowerCase();
      if (email && allowSet.has(email)) {
        userIdsByEmail.set(email, user.id);
      }
    }
    if (data.users.length < perPage) break;
    page += 1;
  }

  const updated: string[] = [];
  const skippedNoProfile: string[] = [];
  const errors: string[] = [];

  for (const email of ADMIN_ALLOWLIST_EMAILS) {
    const userId = userIdsByEmail.get(email.toLowerCase());
    if (!userId) continue;

    const { data: profile, error: readErr } = await admin
      .from("profiles")
      .select("user_id, is_admin")
      .eq("user_id", userId)
      .maybeSingle();

    if (readErr) {
      errors.push(`${email}: read failed ${readErr.message}`);
      continue;
    }
    if (!profile) {
      skippedNoProfile.push(email);
      continue;
    }
    if (profile.is_admin === true) {
      updated.push(`${email} (already admin)`);
      continue;
    }

    const { data: writeData, error: writeErr } = await admin
      .from("profiles")
      .update({ is_admin: true })
      .eq("user_id", userId)
      .select("is_admin")
      .maybeSingle();

    if (writeErr) {
      errors.push(`${email}: update failed ${writeErr.message}`);
      continue;
    }
    if (writeData?.is_admin !== true) {
      errors.push(`${email}: update returned is_admin=${String(writeData?.is_admin)}`);
      continue;
    }
    updated.push(email);
  }

  const notSignedUp = ADMIN_ALLOWLIST_EMAILS.filter(
    (e) => !userIdsByEmail.has(e.toLowerCase())
  );
  return { updated, skippedNoProfile, notSignedUp, errors };
}

async function main() {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (set in prod env or .env.local)"
    );
  }

  const projectRef = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  console.log(`Target Supabase project: ${projectRef ?? url}`);
  console.log(
    "DB trigger (00022): paste supabase/migrations/00022_admin_allowlist_emails.sql into Supabase SQL Editor once."
  );
  console.log("App allowlist + service-role grant run below.\n");

  const { updated, skippedNoProfile, notSignedUp, errors } = await grantExistingAdmins(
    url,
    serviceRoleKey
  );

  console.log("\nAllowlisted admin grant results:");
  if (updated.length > 0) {
    console.log("Granted/confirmed is_admin:", updated.join(", "));
  }
  if (skippedNoProfile.length > 0) {
    console.log(
      "Signed up, no profile yet (admin via app allowlist until onboarding):",
      skippedNoProfile.join(", ")
    );
  }
  if (notSignedUp.length > 0) {
    console.log("Not signed up yet:", notSignedUp.join(", "));
  }
  if (errors.length > 0) {
    console.log("Errors:");
    for (const e of errors) console.log(" -", e);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
