import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthState, requireUser } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Welcome",
};

export default async function OnboardingWelcomePage() {
  await requireUser();
  const state = await getAuthState();
  if (!state.user || !state.profile) {
    redirect("/onboarding");
  }

  const entitlements = await getEntitlements(state.user.id);
  const hasPaid = entitlements.isPro || entitlements.hasRoadmapUnlock;

  return (
    <div className="flex flex-col items-center gap-8 py-6 sm:py-10 max-w-lg mx-auto w-full">
      <Card className="w-full shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            {hasPaid ? "You're all set" : "Profile saved"}
          </CardTitle>
          <CardDescription className="text-base">
            {hasPaid
              ? "Head to your dashboard to view your roadmap and track progress."
              : "Next: your dashboard and roadmap. Before you go—optional upgrades if you want the full plan or Pro tracking."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!hasPaid && (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-4 space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Optional upgrades</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong className="text-foreground">Roadmap Unlock ($29.99 one-time)</strong> —
                  all phases, steps, and resources for your roadmap.
                </li>
                <li>
                  <strong className="text-foreground">Pro ($9.99/mo)</strong> — full roadmap plus
                  tracking in every phase, time logs, charts, and more roadmaps.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/pricing">Compare plans</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/settings">Upgrade in Settings</Link>
                </Button>
              </div>
              <p className="text-xs pt-1">
                Skip this anytime—your free roadmap (Phase 1) is ready on the dashboard.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-stretch">
          <Button asChild className="w-full min-h-[44px] touch-manipulation">
            <Link href="/dashboard">Continue to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
