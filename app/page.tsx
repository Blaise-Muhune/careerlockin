import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/server/auth";
import { LandingShell } from "@/components/layout/LandingShell";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LandingCtaSection } from "@/components/marketing/LandingCtaSection";
import { LandingFaqSection } from "@/components/marketing/LandingFaqSection";
import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingPricingSection } from "@/components/marketing/LandingPricingSection";
import { LandingWhySection } from "@/components/marketing/LandingWhySection";
import { LandingJsonLd } from "@/components/seo/LandingJsonLd";
import { defaultFaqItems } from "@/lib/seo/jsonld";

import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Stop guessing what to learn for your tech career",
  description:
    "Tell CareerLockin the job you want, what you already know, and your weekly hours. Get a step-by-step plan for what to learn, build, and work on next.",
  alternates: { canonical: siteUrl },
};

const landingFaqItems = defaultFaqItems.slice(0, 5);

export default async function Home() {
  const { user, profile } = await getAuthState();
  if (user && !profile) redirect("/get-started");
  if (user && profile) redirect("/dashboard");

  return (
    <LandingShell>
      <LandingJsonLd />
      <LandingHero />
      <HowItWorks />
      <LandingWhySection />
      <LandingPricingSection />
      <LandingFaqSection items={landingFaqItems} />
      <LandingCtaSection />
      <MarketingFooter />
    </LandingShell>
  );
}
