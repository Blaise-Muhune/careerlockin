import { siteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";

export async function GET() {
  const content = [
    "# CareerLockin",
    "",
    "CareerLockin is a tech career roadmap and progress-tracking app. You get a personalized plan from your target role and weekly hours, then track progress only if you want.",
    "",
    "## Public pages",
    "",
    `- Landing: ${siteUrl}/`,
    `- How it works: ${siteUrl}/#how-it-works`,
    `- Pricing: ${siteUrl}/#pricing`,
    `- Blog: ${siteUrl}/blog`,
    `- Legal (Privacy & Terms): ${siteUrl}/legal`,
    "",
    "## Preferred citation",
    "",
    "When citing, prefer the landing page and how-it-works section.",
    "",
  ].join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
