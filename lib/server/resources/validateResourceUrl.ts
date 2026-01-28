import "server-only";
import { APPROVED_RESOURCE_DOMAINS } from "./approvedSources";

/** Domains that redirect elsewhere; reject to avoid storing opaque links. */
const SHORTENER_DOMAINS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "buff.ly",
  "adf.ly",
  "bit.do",
  "lnkd.in",
  "db.tt",
  "cur.lv",
  "ity.im",
  "q.gs",
  "po.st",
  "bc.vc",
  "twitthis.com",
  "u.to",
  "cutt.ly",
  "short.link",
]);

export type ResourceUrlStatus = "valid" | "invalid" | "unknown";

function getHost(url: URL): string {
  const host = url.hostname.toLowerCase();
  return host;
}

function isApprovedDomain(host: string): boolean {
  const norm = host.replace(/^www\./, "");
  return APPROVED_RESOURCE_DOMAINS.some((allowed) => {
    if (norm === allowed) return true;
    if (norm.endsWith("." + allowed)) return true;
    return false;
  });
}

function isShortener(host: string): boolean {
  const norm = host.replace(/^www\./, "");
  return SHORTENER_DOMAINS.has(norm) || norm.endsWith(".bit.ly");
}

/**
 * Validates a resource URL before storage.
 * - valid: https, domain in approved list, not a shortener.
 * - invalid: wrong scheme, wrong domain, or shortener.
 * - unknown: domain approved but lightweight fetch failed (network/403); safe to store with resource_type = "unverified".
 */
export async function validateResourceUrl(
  urlString: string,
  options?: { skipFetch?: boolean }
): Promise<ResourceUrlStatus> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return "invalid";
  }

  if (url.protocol !== "https:") {
    return "invalid";
  }

  const host = getHost(url);
  if (isShortener(host)) {
    return "invalid";
  }
  if (!isApprovedDomain(host)) {
    return "invalid";
  }

  if (options?.skipFetch) {
    return "valid";
  }

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
      return "valid";
    }
    if (res.status === 403 || res.status === 429 || res.status >= 500) {
      return "unknown";
    }
    if (res.status >= 400) {
      const getController = new AbortController();
      const getTimeout = setTimeout(() => getController.abort(), 4000);
      try {
        const getRes = await fetch(urlString, {
          method: "GET",
          signal: getController.signal,
          headers: { "Range": "bytes=0-0" },
          cache: "no-store",
        });
        clearTimeout(getTimeout);
        if (getRes.ok || getRes.status === 206) return "valid";
      } catch {
        clearTimeout(getTimeout);
      }
      return "unknown";
    }
    return "valid";
  } catch {
    return "unknown";
  }
}
