import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Briefcase, BookOpen, Clock } from "lucide-react";
import { getAuthState } from "@/lib/server/auth";
import { LandingShell } from "@/components/layout/LandingShell";
import { RoadmapPreviewMock } from "@/components/marketing/RoadmapPreviewMock";
import { LandingJsonLd } from "@/components/seo/LandingJsonLd";
import { Button } from "@/components/ui/button";

import type { Metadata } from "next";
import { siteUrl, supportEmail } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "A clear roadmap to your tech career",
  description:
    "Get a personalized tech career roadmap from your target role and weekly hours. Track progress only if you want. No guessing. No overload.",
  alternates: { canonical: siteUrl },
};

const containerClass =
  "mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 sm:px-6";

const sectionLabelClass =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

export default async function Home() {
  const { user, profile } = await getAuthState();
  if (user && !profile) redirect("/onboarding");
  if (user && profile) redirect("/dashboard");

  return (
    <LandingShell>
      <LandingJsonLd />
      {/* Hero */}
      <section
        className={`${containerClass} pt-20 sm:pt-24 pb-18 sm:pb-24 text-center relative overflow-hidden`}
        aria-labelledby="hero-heading"
      >
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none"
          aria-hidden
        />
        <p className={sectionLabelClass}>Tech career roadmaps</p>
        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-foreground tracking-tight max-w-3xl mx-auto mt-3"
        >
          One clear path to your next role.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mt-5 max-w-2xl mx-auto leading-relaxed">
          We build you a personalized roadmap from your goal and weekly hours—phases, steps, real resources, and time estimates. No guessing. No overload.
        </p>
        <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
          Personalized with AI · Verified resources · Your pace
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Button asChild size="lg" className="min-h-11 px-8">
            <Link href="/signup">Create my roadmap</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="min-h-11 px-8">
            <Link href="#see-what-you-get">See a preview</Link>
          </Button>
        </div>
      </section>

      {/* See what you get — Roadmap Preview */}
      <section
        id="see-what-you-get"
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="preview-heading"
      >
        <p className={sectionLabelClass}>See what you get</p>
        <h2 id="preview-heading" className="text-2xl sm:text-3xl font-semibold text-foreground text-center mt-2 mb-4 max-w-2xl mx-auto">
          Your roadmap, built for you
        </h2>
        <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10 text-base">
          Phases, steps, verified resources, and time estimates—the same experience you get in the app.
        </p>
        <div className="w-full min-w-0 px-0 sm:px-4">
          <RoadmapPreviewMock />
        </div>
        <p className="text-sm text-muted-foreground text-center mt-8 max-w-md mx-auto">
          No fluff. Clear steps you can follow. Start free—no card required.
        </p>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="how-heading"
      >
        <p className={sectionLabelClass}>How it works</p>
        <h2 id="how-heading" className="text-2xl sm:text-3xl font-semibold text-foreground text-center mt-2 mb-12 sm:mb-14">
          Three steps to a plan you’ll actually use
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm shrink-0" aria-hidden>1</span>
            <h3 className="font-medium text-foreground mt-4 text-base">Set your goal and time</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Tell us your target role and how many hours per week you can invest. We tailor the plan to your reality.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm shrink-0" aria-hidden>2</span>
            <h3 className="font-medium text-foreground mt-4 text-base">Get your personalized roadmap</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              We generate a phased plan with steps, real resources from the web, and time estimates—so you know what to do and how long it takes.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-semibold text-sm shrink-0" aria-hidden>3</span>
            <h3 className="font-medium text-foreground mt-4 text-base">Follow and track—your way</h3>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              Check off steps, log time, and see insights—or use the plan on your own. You stay in control.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-10">
          <Link href="#pricing" className="text-primary hover:underline font-medium">See pricing →</Link>
        </p>
      </section>

      {/* What you get — tiers */}
      <section
        id="what-you-get"
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="tiers-heading"
      >
        <p className={sectionLabelClass}>Plans</p>
        <h2 id="tiers-heading" className="text-2xl sm:text-3xl font-semibold text-foreground text-center mt-2 mb-4">
          Start free. Unlock when you’re ready.
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12 text-base">
          One roadmap, full Phase 1, and a preview of the rest—free. Unlock the full plan once, or go Pro for tracking and insights.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <h3 className="font-medium text-foreground text-base">Free</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground flex-1">
              <li>Generate one roadmap</li>
              <li>Full Phase 1 + preview of rest</li>
              <li>Verified resources & time estimates</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <h3 className="font-medium text-foreground text-base">One-time unlock</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground flex-1">
              <li>Full roadmap, all phases</li>
              <li>Lifetime access to the plan</li>
              <li>Projects & optional challenges</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <h3 className="font-medium text-foreground text-base">Pro</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground flex-1">
              <li>Everything above</li>
              <li>Progress tracking & time logs</li>
              <li>Insights, charts, weekly recap</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Built for */}
      <section
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="built-for-heading"
      >
        <p className={sectionLabelClass}>Built for</p>
        <h2 id="built-for-heading" className="text-2xl sm:text-3xl font-semibold text-foreground text-center mt-2 mb-10">
          People who want clarity, not overwhelm
        </h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-3xl mx-auto">
          <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-foreground">
            <GraduationCap className="h-5 w-5 shrink-0 text-primary/80" aria-hidden />
            <span>Students</span>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-foreground">
            <Briefcase className="h-5 w-5 shrink-0 text-primary/80" aria-hidden />
            <span>Career switchers</span>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-foreground">
            <BookOpen className="h-5 w-5 shrink-0 text-primary/80" aria-hidden />
            <span>Self-taught developers</span>
          </li>
          <li className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-foreground">
            <Clock className="h-5 w-5 shrink-0 text-primary/80" aria-hidden />
            <span>Busy professionals</span>
          </li>
        </ul>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="pricing-heading"
      >
        <p className={sectionLabelClass}>Pricing</p>
        <h2 id="pricing-heading" className="text-2xl sm:text-3xl font-semibold text-foreground text-center mt-2 mb-12">
          Simple, transparent pricing
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <h3 className="font-medium text-foreground text-base">Free</h3>
            <p className="text-sm text-muted-foreground mt-2">
              One roadmap, Phase 1, and a preview. No card required.
            </p>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
            <h3 className="font-medium text-foreground text-base">One-time unlock</h3>
            <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">$19.99</p>
            <p className="text-sm text-muted-foreground mt-1">
              Full plan, all phases, lifetime access.
            </p>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link href="/signup">Unlock full roadmap</Link>
            </Button>
          </div>
          <div className="rounded-xl border-2 border-primary/30 bg-primary/4 p-6 flex flex-col shadow-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-primary">Recommended</span>
            <h3 className="font-medium text-foreground text-base mt-1">Pro</h3>
            <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">
              $9.99<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tracking, time logs, insights, recap emails.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/signup">Start with Pro</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className={`${containerClass} py-16 sm:py-24 border-t border-border/60`}
        aria-labelledby="cta-heading"
      >
        <div className="text-center max-w-2xl mx-auto rounded-2xl border border-border/60 bg-muted/30 px-6 py-12 sm:px-10 sm:py-14">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-semibold text-foreground">
            Stop guessing what to learn next.
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            Get a clear path to your target role in minutes.
          </p>
          <Button asChild size="lg" className="mt-8 min-h-12 px-10">
            <Link href="/signup">Create my roadmap</Link>
          </Button>
        </div>
      </section>

      <footer className={`${containerClass} py-10 border-t border-border/60`}>
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>CareerLockin — Tech career roadmaps and progress tracking.</p>
          <p>
            Questions?{" "}
            <a href={`mailto:${supportEmail}`} className="text-primary hover:underline underline-offset-2">
              Reach out
            </a>
          </p>
        </div>
      </footer>
    </LandingShell>
  );
}