import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Where CTAs should send users (public pricing vs logged-out landing). */
export type PricingCtaContext = "guest" | "onboarding" | "app";

type PricingTiersProps = {
  className?: string;
  /**
   * guest: CTAs go to /signup.
   * onboarding: user is signed in but has no profile yet — continue setup first.
   * app: signed in with profile — free tier opens app; paid tiers open Settings checkout.
   */
  ctaContext?: PricingCtaContext;
};

/**
 * Shared Free / Roadmap Unlock / Pro cards (landing + /pricing).
 */
export function PricingTiers({ className, ctaContext = "guest" }: PricingTiersProps) {
  const freeHref =
    ctaContext === "app" ? "/dashboard" : ctaContext === "onboarding" ? "/onboarding" : "/signup";
  const freeLabel =
    ctaContext === "app"
      ? "Open dashboard"
      : ctaContext === "onboarding"
        ? "Continue setup"
        : "Get started free";

  const paidHref =
    ctaContext === "app" ? "/settings#unlock-options" : ctaContext === "onboarding" ? "/onboarding" : "/signup";
  const unlockLabel =
    ctaContext === "app"
      ? "Buy Roadmap Unlock"
      : ctaContext === "onboarding"
        ? "Continue setup"
        : "Unlock roadmap access";
  const proLabel =
    ctaContext === "app"
      ? "Subscribe in Settings"
      : ctaContext === "onboarding"
        ? "Continue setup"
        : "Start with Pro";

  return (
    <div
      className={cn("grid sm:grid-cols-3 gap-6 sm:gap-8", className)}
      role="list"
    >
      <div
        className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm"
        role="listitem"
      >
        <h3 className="font-medium text-foreground text-base">Free</h3>
        <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">$0</p>
        <p className="text-sm text-muted-foreground mt-2">
          One roadmap, Phase 1 in full, and a preview of later phases. No card
          required.
        </p>
        <Button asChild variant="secondary" className="mt-6 w-full">
          <Link href={freeHref}>{freeLabel}</Link>
        </Button>
      </div>
      <div
        className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm"
        role="listitem"
      >
        <h3 className="font-medium text-foreground text-base">Roadmap Unlock</h3>
        <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">$29.99</p>
        <p className="text-sm text-muted-foreground mt-1">One-time</p>
        <p className="text-sm text-muted-foreground mt-2">
          Full roadmap plus step tracking in every phase. Lifetime access to that
          plan. Time logs and charts require Pro.
        </p>
        <Button asChild variant="secondary" className="mt-6 w-full">
          <Link href={paidHref}>{unlockLabel}</Link>
        </Button>
      </div>
      <div
        className="rounded-xl border-2 border-primary/30 bg-primary/4 p-6 flex flex-col shadow-sm"
        role="listitem"
      >
        <span className="text-xs font-medium uppercase tracking-wide text-primary">
          Recommended
        </span>
        <h3 className="font-medium text-foreground text-base mt-1">Pro</h3>
        <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">
          $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Everything in Roadmap Unlock plus time logs in all phases, charts and
          insights, recap emails, up to five roadmaps, and more regenerations.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href={paidHref}>{proLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
