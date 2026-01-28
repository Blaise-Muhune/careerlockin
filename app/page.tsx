import Link from "next/link";
import { redirect } from "next/navigation";
import { Target, Map, BarChart3, GraduationCap, Briefcase, BookOpen, Clock } from "lucide-react";
import { getAuthState } from "@/lib/server/auth";
import { LandingShell } from "@/components/layout/LandingShell";
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

export default async function Home() {
  const { user, profile } = await getAuthState();
  if (user && !profile) redirect("/onboarding");
  if (user && profile) redirect("/dashboard");

  return (
    <LandingShell>
      <LandingJsonLd />
      {/* Hero */}
      <section
        className={`${containerClass} pt-16 sm:pt-20 pb-14 sm:pb-20 text-center`}
      >
        <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground tracking-tight max-w-2xl mx-auto">
          A clear roadmap to your tech career.
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-xl mx-auto">
          No guessing. No overload.
        </p>
        <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
          Get a personalized plan based on your time, goals, and experience.
          Track progress only if you want.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button asChild size="lg">
            <Link href="/signup">Create my roadmap</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className={`${containerClass} py-14 sm:py-20 border-t border-border/60`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-10 sm:mb-12">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
              <Target className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-medium text-foreground mt-4">Tell us your goal and time.</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You share your target role and how many hours per week you can invest.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
              <Map className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-medium text-foreground mt-4">Get a personalized roadmap.</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We build a phased plan with steps, resources, and time estimates.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
              <BarChart3 className="h-5 w-5" aria-hidden />
            </div>
            <h3 className="font-medium text-foreground mt-4">
              Track progress or just follow the plan.
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Log time, check off steps, and see insights—or use the plan on your own.
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center mt-8">
          <Link href="#pricing" className="text-primary hover:underline">See pricing →</Link>
        </p>
      </section>

      {/* What you get */}
      <section
        id="what-you-get"
        className={`${containerClass} py-14 sm:py-20 border-t border-border/60`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-4">
          What you get for free vs unlock vs pro
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          Free: one roadmap, full Phase 1, preview of the rest. One-time unlock: full plan and lifetime access. Pro: tracking, time logs, and insights.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">Free</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
              <li>Generate roadmap</li>
              <li>Full Phase 1</li>
              <li>Preview later phases</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">One-time unlock</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
              <li>Full roadmap details</li>
              <li>All phases and steps</li>
              <li>Verified resources</li>
              <li>Phase time estimates</li>
              <li>Lifetime access to the plan</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">Pro subscription</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
              <li>Everything above</li>
              <li>Progress tracking</li>
              <li>Time logs</li>
              <li>Insights and charts</li>
              <li>Roadmap updates if goals change</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Built for */}
      <section
        className={`${containerClass} py-14 sm:py-20 border-t border-border/60`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-8 sm:mb-10">
          Built for people who want clarity
        </h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <GraduationCap className="h-5 w-5 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>Students</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <Briefcase className="h-5 w-5 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>Career switchers</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <BookOpen className="h-5 w-5 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>Self-taught developers</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-muted-foreground">
            <Clock className="h-5 w-5 shrink-0 text-muted-foreground/80" aria-hidden />
            <span>Busy professionals</span>
          </li>
        </ul>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className={`${containerClass} py-14 sm:py-20 border-t border-border/60`}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center mb-10 sm:mb-12">
          Pricing
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">Free</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Start with a roadmap and Phase 1. No card required.
            </p>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">One-time unlock</h3>
            <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">
              $19.99
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Full plan, all phases, lifetime access. Pay once.
            </p>
            <Button asChild variant="secondary" className="mt-6 w-full">
              <Link href="/signup">Create my roadmap</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
            <h3 className="font-medium text-foreground text-base">Pro</h3>
            <p className="text-2xl font-semibold tabular-nums text-foreground mt-2">
              $9.99
              <span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Tracking, time logs, insights, and updates.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link href="/signup">Create my roadmap</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section
        className={`${containerClass} py-14 sm:py-20 border-t border-border/60`}
      >
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Stop guessing what to learn next.
          </h2>
          <Button asChild size="lg" className="mt-6">
            <Link href="/signup">Create my roadmap</Link>
          </Button>
        </div>
      </section>

      <footer className={`${containerClass} py-8 border-t border-border/60`}>
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>CareerLockin — Tech career roadmaps and progress tracking.</p>
          <p>
            Questions?{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-primary hover:underline underline-offset-2"
            >
              Reach out
            </a>
          </p>
        </div>
      </footer>
    </LandingShell>
  );
}