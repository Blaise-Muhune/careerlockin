import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getEnv } from "@/lib/server/env";

const MAX_MARKDOWN = 12_000;
const FRESH_MS = 14 * 24 * 60 * 60 * 1000;

function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Reads one public page as markdown. Cached for two weeks.
 * Returns null when the page cannot be read; callers keep the plain link.
 */
export async function readResourceMarkdown(url: string): Promise<string | null> {
  if (!isHttpsUrl(url)) return null;
  const supabase = createServiceRoleClient();
  const { data: cached } = await supabase
    .from("resource_reads")
    .select("markdown, fetched_at")
    .eq("url", url)
    .maybeSingle();

  if (cached?.markdown && cached.fetched_at) {
    const age = Date.now() - new Date(cached.fetched_at).getTime();
    if (age >= 0 && age < FRESH_MS) return cached.markdown as string;
  }

  const key = getEnv().JINA_API_KEY;
  const headers: Record<string, string> = {
    Accept: "text/plain",
    "User-Agent": "CareerLockin",
  };
  if (key) headers.Authorization = `Bearer ${key}`;

  try {
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return cached?.markdown ?? null;
    const text = (await response.text()).trim().slice(0, MAX_MARKDOWN);
    if (text.length < 40) return cached?.markdown ?? null;
    await supabase.from("resource_reads").upsert({
      url,
      markdown: text,
      fetched_at: new Date().toISOString(),
    });
    return text;
  } catch {
    return cached?.markdown ?? null;
  }
}
