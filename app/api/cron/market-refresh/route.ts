import { NextResponse } from "next/server";
import { getEnv } from "@/lib/server/env";
import { refreshStaleMarkets } from "@/lib/server/study/refreshMarket";

function isAuthorized(request: Request): boolean {
  const secret = getEnv().CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("token") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await refreshStaleMarkets();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Job failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}
