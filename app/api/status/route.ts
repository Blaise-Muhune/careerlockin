import { NextResponse } from "next/server";

/** Lightweight health/status for prod debugging. No DB queries. */
export async function GET() {
  const env =
    process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "dev");
  const version = process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown";
  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      version,
      env,
      supabaseConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
      ),
    },
    { status: 200 }
  );
}
