import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PricingTiersProps = {
  className?: string;
};

/**
 * Shared Free / Roadmap Unlock / Pro cards (landing + /pricing).
 */
export function PricingTiers({ className }: PricingTiersProps) {
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
          <Link href="/signup">Get started free</Link>
        </Button>
      </div>
      <div
        className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm"
        role="listitem"
      >
        <h3 className="font-medium text-foreground text-base">Roadmap Unlock</h3>
        <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">$19.99</p>
        <p className="text-sm text-muted-foreground mt-1">One-time</p>
        <p className="text-sm text-muted-foreground mt-2">
          Full roadmap content: all phases, steps, and resources. Lifetime access
          to that plan. Tracking stays on Phase 1 unless you upgrade to Pro.
        </p>
        <Button asChild variant="secondary" className="mt-6 w-full">
          <Link href="/signup">Unlock roadmap access</Link>
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
          Everything in Roadmap Unlock plus tracking in all phases, time logs,
          charts and insights, recap emails, and up to five roadmaps.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/signup">Start with Pro</Link>
        </Button>
      </div>
    </div>
  );
}
