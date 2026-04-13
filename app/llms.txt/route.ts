import { buildLlmsTxtMarkdown } from "@/lib/seo/llmsTxtContent";

export const dynamic = "force-static";

export async function GET() {
  const content = buildLlmsTxtMarkdown();

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
