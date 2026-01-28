import "server-only";

/**
 * Allowed domains for roadmap resource URLs.
 * Subdomains are accepted (e.g. docs.python.org matches developer.mozilla.org).
 * Used by URL validation before saving resources.
 */
export const APPROVED_RESOURCE_DOMAINS: readonly string[] = [
  "developer.mozilla.org",
  "docs.python.org",
  "react.dev",
  "nextjs.org",
  "supabase.com",
  "stripe.com",
  "freecodecamp.org",
  "web.dev",
  "learn.microsoft.com",
  "typescriptlang.org",
  "github.com", // official org docs or reputable repos only; validated conservatively
] as const;

export type ApprovedDomain = (typeof APPROVED_RESOURCE_DOMAINS)[number];
