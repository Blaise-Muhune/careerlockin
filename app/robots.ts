import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/site";

const privatePaths = [
  "/dashboard",
  "/dashboard/",
  "/roadmap",
  "/roadmap/",
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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: privatePaths,
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
