import {
  organizationSchema,
  webSiteSchema,
  softwareApplicationSchema,
  faqPageSchema,
  defaultFaqItems,
  jsonLdScript,
} from "@/lib/seo/jsonld";

/**
 * Renders JSON-LD scripts for the landing page (Organization, WebSite, SoftwareApplication, FAQPage).
 * Marketing pages only; no user data.
 */
export function LandingJsonLd() {
  const org = jsonLdScript(organizationSchema());
  const web = jsonLdScript(webSiteSchema());
  const app = jsonLdScript(softwareApplicationSchema());
  const faq = jsonLdScript(faqPageSchema(defaultFaqItems));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: org }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: web }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: app }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faq }}
      />
    </>
  );
}
