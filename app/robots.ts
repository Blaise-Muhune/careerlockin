import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

/** Auth and app surfaces — not for broad indexing. */
const privatePaths = [
  "/dashboard",
  "/dashboard/",
  "/roadmap",
  "/roadmap/",
  "/roadmaps",
  "/roadmaps/",
  "/settings",
  "/settings/",
  "/onboarding",
  "/onboarding/",
  "/login",
  "/login/",
  "/signup",
  "/signup/",
  "/admin",
  "/admin/",
];

/**
 * Same allow rules for general search + common AI/search crawlers so public
 * marketing, blog, and legal pages stay discoverable without exposing app routes.
 */
const userAgents = [
  "*",
  "GPTBot",
  "OAI-SearchBot",
  "Google-Extended",
  "Googlebot",
  "Bingbot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "PerplexityBot",
  "Applebot-Extended",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: userAgents.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: privatePaths,
    })),
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
