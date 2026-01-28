/**
 * SEO / AI discovery: single source of truth for site identity.
 * Used by metadata, sitemap, robots, llms.txt.
 */

const siteName = "CareerLockin";
const siteDescription =
  "Tech career roadmap and progress tracking. Get a personalized plan from your target role and weekly hours. Track progress only if you want.";
const defaultOgImagePath = "/og.png";

/** Contact/support email for users to reach out. */
export const supportEmail = "blaisemu007@gmail.com";

/** Production URL. Prefer NEXT_PUBLIC_SITE_URL; fall back to NEXT_PUBLIC_APP_URL. */
function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!url || url === "") {
    return "https://careerlockin.com";
  }
  return url.replace(/\/$/, "");
}

export const siteUrl = getSiteUrl();
export { siteName, siteDescription, defaultOgImagePath };

export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  siteDescription: string;
  defaultOgImagePath: string;
  /** Optional: Twitter handle without @ */
  twitterHandle?: string;
};

export function getSiteConfig(): SiteConfig {
  return {
    siteName,
    siteUrl,
    siteDescription,
    defaultOgImagePath,
    twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? undefined,
  };
}
