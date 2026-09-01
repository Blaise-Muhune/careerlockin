import Link from "next/link";

import type { Metadata } from "next";

import {

  PricingTiers,

  type PricingCtaContext,

} from "@/components/marketing/PricingTiers";

import { PlanComparisonTable } from "@/components/marketing/PlanComparisonTable";

import { MarketingPage } from "@/components/layout/MarketingPage";

import { LandingReveal } from "@/components/marketing/LandingReveal";

import { getAuthState } from "@/lib/server/auth";

import { marketingEyebrowClass } from "@/lib/layout/marketing";

import { siteUrl } from "@/lib/seo/site";



export const revalidate = 3600;



export const metadata: Metadata = {

  title: "Pricing",

  description:

    "CareerLockin plans: Free roadmap preview, one-time Roadmap Unlock for full content and step tracking, and Pro for time logs, insights, and multiple roadmaps.",

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

    <MarketingPage

      eyebrow="Pricing"

      title="Start free. Unlock when you're ready."

      description="One roadmap, full Phase 1, and a preview of the rest. No card required. Upgrade once for the full plan, or subscribe to Pro for tracking and insights."

    >

      <LandingReveal>

        <PricingTiers ctaContext={ctaContext} emphasizePro />

      </LandingReveal>



      <section

        className="mt-14 sm:mt-16 border-t border-border/50 pt-10 sm:pt-12"

        aria-labelledby="compare-heading"

      >

        <LandingReveal delay={0.05}>

          <p className={marketingEyebrowClass}>Compare plans</p>

          <h2 id="compare-heading" className="text-2xl sm:text-3xl font-bold tracking-tight mt-3 mb-6">

            What you get at a glance

          </h2>

          <PlanComparisonTable />

        </LandingReveal>

      </section>



      <LandingReveal delay={0.1} className="mt-10">

        <p className="text-sm text-muted-foreground">

          {ctaContext === "app" ? (

            <>

              You&apos;re signed in.{" "}

              <Link

                href="/settings#unlock-options"

                className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline"

              >

                Open Settings to upgrade or pay

              </Link>

            </>

          ) : ctaContext === "onboarding" ? (

            <>

              Finish your profile, then you can pay in Settings.{" "}

              <Link

                href="/onboarding"

                className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline"

              >

                Continue onboarding

              </Link>

            </>

          ) : (

            <>

              Already have an account?{" "}

              <Link href="/login" className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline">

                Log in

              </Link>

              {" · "}

              <Link href="/signup" className="font-semibold text-foreground hover:text-primary underline-offset-4 hover:underline">

                Sign up

              </Link>

            </>

          )}

        </p>

      </LandingReveal>

    </MarketingPage>

  );

}

