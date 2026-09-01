import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  marketingContainerClass,
  marketingPrimaryCtaClass,
  marketingSplitTitleClass,
} from "@/lib/layout/marketing";
import { LandingReveal } from "./LandingReveal";

export function LandingCtaSection() {
  return (
    <section
      className={`${marketingContainerClass} py-12 sm:py-20 lg:py-24 border-t border-border/50`}
      aria-labelledby="cta-heading"
    >
      <LandingReveal className="max-w-2xl">
        <h2 id="cta-heading" className={marketingSplitTitleClass}>
          Stop guessing what to do next.{" "}
          <span className="text-muted-foreground">Start with Phase 1 free.</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 sm:mt-8">
          <Button asChild size="lg" className={`${marketingPrimaryCtaClass} w-full sm:w-auto text-base`}>
            <Link href="/get-started">Create my roadmap →</Link>
          </Button>
          <Link
            href="/login"
            className="text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline min-h-11 inline-flex items-center justify-center sm:justify-start"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </LandingReveal>
    </section>
  );
}
