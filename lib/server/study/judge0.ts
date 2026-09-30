import "server-only";
import { getEnv } from "@/lib/server/env";

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
} as const;

export type CodeLanguage = keyof typeof LANGUAGE_IDS;

export type CodeRunResult = {
  ok: true;
  status: string;
  stdout: string;
  stderr: string;
} | {
  ok: false;
  error: string;
};

export async function runSnippet(
  source: string,
  language: CodeLanguage
): Promise<CodeRunResult> {
  const base = getEnv().JUDGE0_API_URL?.replace(/\/$/, "");
  if (!base) {
    return { ok: false, error: "Code check is not configured yet." };
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const key = getEnv().JUDGE0_API_KEY;
  if (key && base.includes("rapidapi.com")) {
    headers["X-RapidAPI-Key"] = key;
    headers["X-RapidAPI-Host"] = new URL(base).host;
  } else if (key) {
    headers["X-Auth-Token"] = key;
  }

  try {
    const response = await fetch(
      `${base}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          source_code: source,
          language_id: LANGUAGE_IDS[language],
        }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!response.ok) {
      return { ok: false, error: "The code runner did not accept that snippet." };
    }
    const body: unknown = await response.json();
    if (typeof body !== "object" || body === null) {
      return { ok: false, error: "The code runner returned an unexpected result." };
    }
    const record = body as Record<string, unknown>;
    const status =
      typeof record.status === "object" &&
      record.status !== null &&
      "description" in record.status &&
      typeof (record.status as { description?: unknown }).description === "string"
        ? (record.status as { description: string }).description
        : "Finished";
    const stdout = typeof record.stdout === "string" ? record.stdout.slice(0, 1500) : "";
    const stderrSource =
      typeof record.stderr === "string"
        ? record.stderr
        : typeof record.compile_output === "string"
          ? record.compile_output
          : "";
    return { ok: true, status, stdout, stderr: stderrSource.slice(0, 1500) };
  } catch {
    return { ok: false, error: "The code runner timed out." };
  }
}
