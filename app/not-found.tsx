import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingShell } from "@/components/layout/LandingShell";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import {
  marketingContainerClass,
  marketingEyebrowClass,
  marketingPrimaryCtaClass,
  marketingSectionTitleClass,
} from "@/lib/layout/marketing";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <LandingShell>
      <div
        className={cn(
          marketingContainerClass,
          "py-24 sm:py-32 flex flex-col items-center justify-center text-center"
        )}
      >
        <p className={marketingEyebrowClass}>404</p>
        <h1 className={cn(marketingSectionTitleClass, "mt-3")}>Page not found</h1>
        <p className="mt-4 text-muted-foreground max-w-md leading-relaxed">
          This page doesn&apos;t exist or may have been moved.
        </p>
        <Button asChild size="lg" className={cn("mt-8 rounded-full", marketingPrimaryCtaClass)}>
          <Link href="/">Back to home</Link>
        </Button>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link
            href="/pricing"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Pricing
          </Link>
          <Link
            href="/blog"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Blog
          </Link>
          <Link
            href="/legal"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Legal
          </Link>
          <Link
            href="/login"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </nav>
      </div>
      <MarketingFooter />
    </LandingShell>
  );
}
