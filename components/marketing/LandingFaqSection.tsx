import {
  marketingContainerClass,
  marketingEyebrowClass,
  marketingSectionLeadClass,
  marketingSectionTitleClass,
} from "@/lib/layout/marketing";
import type { FaqItem } from "@/lib/seo/jsonld";
import { LandingFaq } from "./LandingFaq";
import { LandingReveal } from "./LandingReveal";

type LandingFaqSectionProps = {
  items: FaqItem[];
};

export function LandingFaqSection({ items }: LandingFaqSectionProps) {
  return (
    <section
      id="faq"
      className={`${marketingContainerClass} py-12 sm:py-20 lg:py-28 border-t border-border/50`}
      aria-labelledby="faq-heading"
    >
      <LandingReveal className="mb-10 sm:mb-12">
        <p className={marketingEyebrowClass}>FAQ</p>
        <h2 id="faq-heading" className={`${marketingSectionTitleClass} mt-4`}>
          Common questions
        </h2>
        <p className={marketingSectionLeadClass}>
          Learning tech should not mean drowning in options. Here is how
          CareerLockin works before you sign up.
        </p>
      </LandingReveal>

      <LandingReveal delay={0.05} className="max-w-3xl">
        <LandingFaq items={items} />
      </LandingReveal>
    </section>
  );
}
