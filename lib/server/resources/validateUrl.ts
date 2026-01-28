import "server-only";

const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "cutt.ly",
  "short.link",
]);

export type UrlValidationResult = {
  status: "valid" | "invalid" | "unknown";
  reason: string;
};

function getHost(url: URL): string {
  return url.hostname.toLowerCase().replace(/^www\./, "");
}

function isShortener(host: string): boolean {
  return SHORTENER_DOMAINS.has(host) || host.endsWith(".bit.ly");
}

/**
 * Validates a resource URL: must be https, not a shortener.
 * Does not perform network requests. Use verifyUrlReachable to check that the link works.
 */
export function validateUrl(urlString: string): UrlValidationResult {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { status: "invalid", reason: "Invalid URL" };
  }

  if (url.protocol !== "https:") {
    return { status: "invalid", reason: "URL must use https" };
  }

  const host = getHost(url);
  if (isShortener(host)) {
    return { status: "invalid", reason: "URL shorteners are not allowed" };
  }

  return { status: "valid", reason: "OK" };
}

/**
 * Tries HEAD, then GET; treats 403/429 as unknown (not auto-fail).
 */
export async function verifyUrlReachable(urlString: string): Promise<UrlValidationResult> {
  const staticResult = validateUrl(urlString);
  if (staticResult.status === "invalid") return staticResult;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(urlString, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "CareerLockin/1.0 (resource-verification)" },
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (res.ok || res.status === 405) {
      return { status: "valid", reason: "OK" };
    }
    if (res.status === 403 || res.status === 429 || res.status >= 500) {
      return { status: "unknown", reason: `HTTP ${res.status}` };
    }
    if (res.status >= 400) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 4000);
      try {
        const getRes = await fetch(urlString, {
          method: "GET",
          signal: getController.signal,
          headers: { Range: "bytes=0-0" },
          cache: "no-store",
        });
        clearTimeout(getTimeout);
        if (getRes.ok || getRes.status === 206) {
          return { status: "valid", reason: "OK" };
        }
      } catch {
        clearTimeout(getTimeout);
      }
      return { status: "unknown", reason: `HTTP ${res.status}` };
    }
    return { status: "valid", reason: "OK" };
  } catch {
    return { status: "unknown", reason: "Unreachable or timeout" };
  }
}
