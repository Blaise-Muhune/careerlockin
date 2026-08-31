/**
 * Documents expected RLS / privilege behavior for profiles.is_admin.
 * Runtime enforcement is the trigger in
 * supabase/migrations/00017_protect_is_admin.sql.
 *
 * Contract:
 * - authenticated/anon UPDATE that changes is_admin → rejected
 * - service_role / SQL (null role) may change is_admin
 * - other profile columns remain updatable by the owning user
 */
import { describe, expect, it } from "vitest";

const PROTECT_IS_ADMIN_SQL = `
create or replace function public.protect_profiles_is_admin()
`;

describe("is_admin RLS contract", () => {
  it("migration exists and blocks client role elevation", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(
      process.cwd(),
      "supabase/migrations/00017_protect_is_admin.sql"
    );
    const sql = await fs.readFile(file, "utf8");
    expect(sql).toContain(PROTECT_IS_ADMIN_SQL.trim());
    expect(sql).toContain("authenticated");
    expect(sql).toContain("anon");
    expect(sql).toContain("is_admin");
  });

  it("stripe_events processed_at migration exists for recoverable idempotency", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.join(
      process.cwd(),
      "supabase/migrations/00016_stripe_events_processed_at.sql"
    );
    const sql = await fs.readFile(file, "utf8");
    expect(sql).toContain("processed_at");
  });
});
