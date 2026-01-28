import "server-only";

/** Keys whose values must never be logged (secrets, tokens). */
const SENSITIVE_KEYS = new Set([
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "key",
  "api_key",
  "apikey",
  "access_token",
  "refresh_token",
  "stripe_signature",
  "stripe-signature",
]);

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (SENSITIVE_KEYS.has(lower) || lower.includes("secret") || lower.includes("token")) {
      out[k] = "[REDACTED]";
    } else if (v !== null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = sanitize(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/**
 * Log an error and report to Sentry when DSN is configured.
 * extra is sanitized: no secrets, tokens, or sensitive keys.
 */
export async function logError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>
): Promise<void> {
  const safe = extra ? sanitize(extra) : undefined;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.setTag("context", context);
    if (safe && Object.keys(safe).length > 0) {
      Sentry.setContext("extra", safe);
    }
    Sentry.captureException(error);
  } catch {
    // Sentry not configured or import failed; avoid breaking the app
  }
}

/**
 * Log an info-level message. Optionally report to Sentry as a message when DSN is set.
 * extra is sanitized: no secrets or tokens.
 */
export async function logInfo(
  context: string,
  extra?: Record<string, unknown>
): Promise<void> {
  const safe = extra ? sanitize(extra) : undefined;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.setTag("context", context);
    if (safe && Object.keys(safe).length > 0) {
      Sentry.setContext("extra", safe);
    }
    Sentry.captureMessage(`[${context}]`, "info");
  } catch {
    // Sentry not configured; no-op
  }
}
