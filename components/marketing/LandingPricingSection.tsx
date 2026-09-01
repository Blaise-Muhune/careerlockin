import Link from "next/link";
import {
  marketingContainerClass,
  marketingEyebrowClass,
  marketingSectionLeadClass,
  marketingSectionTitleClass,
} from "@/lib/layout/marketing";
import { PricingTiers } from "./PricingTiers";
import { LandingReveal } from "./LandingReveal";

export function LandingPricingSection() {
  return (
    <section
      id="pricing"
      className={`${marketingContainerClass} py-12 sm:py-20 lg:py-28 border-t border-border/50`}
      aria-labelledby="pricing-heading"
    >
      <LandingReveal className="mb-12 sm:mb-14">
        <p className={marketingEyebrowClass}>Pricing</p>
        <h2 id="pricing-heading" className={`${marketingSectionTitleClass} mt-4`}>
          Start free. Unlock when you&apos;re ready.
        </h2>
        <p className={marketingSectionLeadClass}>
          Full Phase 1 and a preview of later phases at no cost. Upgrade once
          for the complete plan, or go Pro for time logs, charts, and more
          roadmaps.
        </p>
      </LandingReveal>

      <LandingReveal delay={0.05}>
        <PricingTiers emphasizePro={false} />
      </LandingReveal>

      <LandingReveal delay={0.1} className="mt-8">
        <p className="text-sm text-muted-foreground">
          <Link
            href="/pricing"
            className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline"
          >
            Full comparison on the pricing page →
          </Link>
        </p>
      </LandingReveal>
    </section>
  );
}
