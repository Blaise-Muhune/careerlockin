import "server-only";
import { getEnv } from "@/lib/server/env";
import { skillsFromPostings } from "@/lib/study/marketMatch";

const ONET_BASE = "https://api-v2.onetcenter.org";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function collectNames(value: unknown, into: string[], depth = 0): void {
  if (depth > 6) return;
  if (Array.isArray(value)) {
    for (const item of value) collectNames(item, into, depth + 1);
    return;
  }
  if (!isRecord(value)) return;
  if (typeof value.name === "string" && value.name.length >= 2 && value.name.length <= 80) {
    into.push(value.name);
  }
  if (typeof value.statement === "string") into.push(value.statement);
  for (const nested of Object.values(value)) {
    if (typeof nested === "object" && nested !== null) collectNames(nested, into, depth + 1);
  }
}

async function onetGet(path: string, apiKey: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${ONET_BASE}${path}`, {
      headers: {
        Accept: "application/json",
        "X-API-Key": apiKey,
        "User-Agent": "CareerLockin",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchOccupationSignals(targetRole: string): Promise<{
  occupationTitle: string | null;
  signals: string[];
  configured: boolean;
}> {
  const env = getEnv();
  const signals: string[] = [];
  let occupationTitle: string | null = null;
  let configured = false;

  if (env.ONET_API_KEY) {
    configured = true;
    const search = await onetGet(
      `/online/search?keyword=${encodeURIComponent(targetRole)}&end=1`,
      env.ONET_API_KEY
    );
    const occupation =
      isRecord(search) && Array.isArray(search.occupation) ? search.occupation[0] : null;
    const code =
      isRecord(occupation) && typeof occupation.code === "string" ? occupation.code : null;
    if (isRecord(occupation) && typeof occupation.title === "string") {
      occupationTitle = occupation.title;
    }
    if (code) {
      const [tasks, tech] = await Promise.all([
        onetGet(`/online/occupations/${encodeURIComponent(code)}/summary/tasks`, env.ONET_API_KEY),
        onetGet(
          `/online/occupations/${encodeURIComponent(code)}/summary/technology_skills`,
          env.ONET_API_KEY
        ),
      ]);
      const names: string[] = [];
      collectNames(tasks, names);
      collectNames(tech, names);
      signals.push(...names.slice(0, 30));
    }
  }

  if (env.ADZUNA_APP_ID && env.ADZUNA_APP_KEY) {
    configured = true;
    const country = /^[a-z]{2}$/i.test(env.ADZUNA_COUNTRY ?? "")
      ? (env.ADZUNA_COUNTRY ?? "us").toLowerCase()
      : "us";
    const url = new URL(
      `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1`
    );
    url.searchParams.set("app_id", env.ADZUNA_APP_ID);
    url.searchParams.set("app_key", env.ADZUNA_APP_KEY);
    url.searchParams.set("results_per_page", "20");
    url.searchParams.set("what", targetRole);
    url.searchParams.set("content-type", "application/json");
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (response.ok) {
        const body: unknown = await response.json();
        const results =
          isRecord(body) && Array.isArray(body.results) ? body.results : [];
        const texts = results
          .map((item) => {
            if (!isRecord(item)) return "";
            const title = typeof item.title === "string" ? item.title : "";
            const description = typeof item.description === "string" ? item.description : "";
            return `${title}\n${description}`;
          })
          .filter((text) => text.length > 0);
        signals.push(...skillsFromPostings(texts));
      }
    } catch {
      // Postings are optional. Occupation data can stand alone.
    }
  }

  const unique = [...new Set(signals.map((signal) => signal.trim()).filter(Boolean))].slice(0, 40);
  return { occupationTitle, signals: unique, configured };
}
