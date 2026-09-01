/**
 * JSON-LD helpers for structured data (rich results, AI comprehension).
 * Renders schema objects into script tags; use only trusted data (site config, static content).
 */

import { siteName, siteUrl, siteDescription, supportEmail } from "./site";

export type JsonLdValue = string | number | boolean | null | JsonLdValue[] | { [key: string]: JsonLdValue };

/**
 * Renders a schema object as a JSON-LD script tag. Use only for trusted, server-side data.
 */
export function jsonLdScript(obj: Record<string, JsonLdValue>): string {
  return JSON.stringify(obj);
}

/** Organization schema for the product. */
export function organizationSchema(): Record<string, JsonLdValue> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: supportEmail,
      url: `${siteUrl}/legal`,
    },
  };
}

/** WebSite schema. No SearchAction (no in-app search). */
export function webSiteSchema(): Record<string, JsonLdValue> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: siteDescription,
  };
}

/** SoftwareApplication schema describing the product. */
export function softwareApplicationSchema(): Record<string, JsonLdValue> {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description: siteDescription,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: 0,
      highPrice: 29.99,
      offerCount: 3,
    },
  };
}

export type FaqItem = { question: string; answer: string };

/** FAQPage schema. Pass 6–8 real FAQ items. */
export function faqPageSchema(items: FaqItem[]): Record<string, JsonLdValue> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/** Default FAQ items for landing page. */
export const defaultFaqItems: FaqItem[] = [
  {
    question: "What does CareerLockin do?",
    answer:
      "CareerLockin builds a tech career roadmap from your target role and hours per week. You get phases, steps, and resources so you know what to do next. Track progress and log time if you want, or follow the plan on your own.",
  },
  {
    question: "What is included for free?",
    answer:
      "Free includes: one roadmap, full access to Phase 1, and a preview of later phases. No card required.",
  },
  {
    question: "What is the one-time unlock vs Pro subscription?",
    answer:
      "One-time unlock ($29.99) gives full roadmap details, all phases and steps, curated resources, and lifetime access. Pro ($9.99/month) adds time logs, insights, charts, and more roadmap refreshes.",
  },
  {
    question: "How is my roadmap built?",
    answer:
      "You share your target role (e.g. front-end developer), weekly hours, and optionally prior exposure and learning style. CareerLockin turns that into a phased plan with steps and 1–2 resources per step. The plan is saved in your account and only you can edit it.",
  },
  {
    question: "Does CareerLockin track or sell my data?",
    answer:
      "We do not sell your data. We use your inputs only to generate and store your roadmap and progress. We use minimal analytics; no invasive tracking. See our Privacy Policy for details.",
  },
  {
    question: "Can I use the roadmap without signing in after it's created?",
    answer:
      "Your roadmap and progress are stored in your account. To view or update them, you sign in. Free users get full Phase 1 and a preview of the rest; one-time unlock or Pro gives full access to all phases.",
  },
];
