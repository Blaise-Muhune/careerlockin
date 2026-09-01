import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appMonoStatClass } from "@/lib/layout/app";
import { marketingFeatureCardClass, marketingPrimaryCtaClass } from "@/lib/layout/marketing";
import { cn } from "@/lib/utils";

/** Where CTAs should send users (public pricing vs logged-out landing). */
export type PricingCtaContext = "guest" | "onboarding" | "app";

type PricingTiersProps = {
  className?: string;
  /** Show loud Pro highlight (pricing page). Softer on landing. */
  emphasizePro?: boolean;
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
export function PricingTiers({
  className,
  emphasizePro = true,
  ctaContext = "guest",
}: PricingTiersProps) {
  const freeHref =
    ctaContext === "app" ? "/dashboard" : ctaContext === "onboarding" ? "/get-started" : "/get-started";
  const freeLabel =
    ctaContext === "app"
      ? "Open dashboard"
      : ctaContext === "onboarding"
        ? "Continue setup"
        : "Get started free";

  const paidHref =
    ctaContext === "app" ? "/settings#unlock-options" : ctaContext === "onboarding" ? "/get-started" : "/get-started";
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
      className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8", className)}
      role="list"
    >
      <div
        className={cn(marketingFeatureCardClass, "flex flex-col")}
        role="listitem"
      >
        <h3 className="font-bold text-foreground text-base">Free</h3>
        <p className={cn("text-2xl font-bold text-foreground mt-2", appMonoStatClass)}>$0</p>
        <p className="text-sm text-muted-foreground mt-2">
          One roadmap, Phase 1 in full, and a preview of later phases. No card
          required.
        </p>
        <Button asChild variant="secondary" className="mt-6 w-full min-h-11 rounded-xl text-base touch-manipulation">
          <Link href={freeHref}>{freeLabel}</Link>
        </Button>
      </div>
      <div
        className={cn(marketingFeatureCardClass, "flex flex-col")}
        role="listitem"
      >
        <h3 className="font-bold text-foreground text-base">Roadmap Unlock</h3>
        <p className={cn("text-2xl font-bold text-foreground mt-2", appMonoStatClass)}>$29.99</p>
        <p className="text-sm text-muted-foreground mt-1">One-time</p>
        <p className="text-sm text-muted-foreground mt-2">
          Full roadmap plus step tracking in every phase. Lifetime access to that
          plan. Time logs and charts require Pro.
        </p>
        <Button asChild variant="secondary" className="mt-6 w-full min-h-11 rounded-xl text-base touch-manipulation">
          <Link href={paidHref}>{unlockLabel}</Link>
        </Button>
      </div>
      <div
        className={cn(
          marketingFeatureCardClass,
          "flex flex-col",
          emphasizePro && "border-primary/25 bg-primary/[0.03]"
        )}
        role="listitem"
      >
        {emphasizePro ? (
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Recommended
          </span>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Subscription
          </span>
        )}
        <h3 className="font-bold text-foreground text-base mt-1">Pro</h3>
        <p className={cn("text-2xl font-bold text-foreground mt-2", appMonoStatClass)}>
          $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Everything in Roadmap Unlock plus time logs in all phases, charts and
          insights, recap emails, up to five roadmaps, and more roadmap refreshes.
        </p>
        <Button asChild className={cn("mt-6 w-full min-h-11 rounded-xl text-base touch-manipulation", emphasizePro && marketingPrimaryCtaClass)}>
          <Link href={paidHref}>{proLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
