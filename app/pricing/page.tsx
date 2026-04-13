import Link from "next/link";
import type { Metadata } from "next";
import {
  PricingTiers,
  type PricingCtaContext,
} from "@/components/marketing/PricingTiers";
import { getAuthState } from "@/lib/server/auth";
import { siteUrl } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "CareerLockin plans: Free roadmap preview, one-time Roadmap Unlock for full content, and Pro for tracking, insights, and multiple roadmaps.",
  alternates: { canonical: `${siteUrl}/pricing` },
};

function pricingCtaContextFromAuth(
  state: Awaited<ReturnType<typeof getAuthState>>
): PricingCtaContext {
  if (!state.user) return "guest";
  if (!state.profile) return "onboarding";
  return "app";
}

export default async function PricingPage() {
  const auth = await getAuthState();
  const ctaContext = pricingCtaContextFromAuth(auth);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:max-w-5xl">
        <p className="mb-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to home
          </Link>
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          Pricing
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl mb-10">
          Simple tiers: start free, unlock the full roadmap once, or subscribe
          to Pro for ongoing tracking and deeper insights. You can always upgrade
          later in Settings.
        </p>

        <PricingTiers ctaContext={ctaContext} />

        <section className="mt-14 sm:mt-16 border-t border-border/60 pt-10" aria-labelledby="compare-heading">
          <h2 id="compare-heading" className="text-lg font-semibold text-foreground mb-4">
            What you get at a glance
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
            <table className="w-full text-sm text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="p-3 font-medium text-foreground">Capability</th>
                  <th className="p-3 font-medium text-foreground">Free</th>
                  <th className="p-3 font-medium text-foreground">Unlock</th>
                  <th className="p-3 font-medium text-foreground">Pro</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/40">
                  <td className="p-3 text-foreground font-medium">Roadmap generated</td>
                  <td className="p-3">Yes</td>
                  <td className="p-3">Yes</td>
                  <td className="p-3">Yes (up to 5)</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="p-3 text-foreground font-medium">Phase 1 content</td>
                  <td className="p-3">Full</td>
                  <td className="p-3">Full</td>
                  <td className="p-3">Full</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="p-3 text-foreground font-medium">Later phases & resources</td>
                  <td className="p-3">Preview</td>
                  <td className="p-3">Full</td>
                  <td className="p-3">Full</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="p-3 text-foreground font-medium">Step tracking</td>
                  <td className="p-3">Phase 1 only</td>
                  <td className="p-3">Phase 1 only</td>
                  <td className="p-3">All phases</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="p-3 text-foreground font-medium">Time logs & charts</td>
                  <td className="p-3">—</td>
                  <td className="p-3">—</td>
                  <td className="p-3">Yes</td>
                </tr>
                <tr>
                  <td className="p-3 text-foreground font-medium">Recap / milestone emails</td>
                  <td className="p-3">—</td>
                  <td className="p-3">—</td>
                  <td className="p-3">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-10 text-sm text-muted-foreground text-center">
          {ctaContext === "app" ? (
            <>
              You're signed in —{" "}
              <Link href="/settings#unlock-options" className="text-primary font-medium hover:underline underline-offset-2">
                open Settings to upgrade or pay
              </Link>
            </>
          ) : ctaContext === "onboarding" ? (
            <>
              Finish your profile, then you can pay in Settings —{" "}
              <Link href="/onboarding" className="text-primary font-medium hover:underline underline-offset-2">
                continue onboarding
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline underline-offset-2">
                Log in
              </Link>
              {" · "}
              <Link href="/signup" className="text-primary font-medium hover:underline underline-offset-2">
                Sign up
              </Link>
            </>
          )}
          {" · "}
          <Link href="/legal" className="text-primary font-medium hover:underline underline-offset-2">
            Privacy & terms
          </Link>
        </p>
      </div>
    </div>
  );
}
