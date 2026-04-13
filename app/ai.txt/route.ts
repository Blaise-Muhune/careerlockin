import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/seo/site";

/** Some tools probe `/ai.txt`; single source of truth is `/llms.txt`. */
export const dynamic = "force-static";

export function GET() {
  return NextResponse.redirect(new URL("/llms.txt", siteUrl), 308);
}
