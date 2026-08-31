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
import { getLatestRoadmapForUser } from "@/lib/server/db/roadmaps";
import { redirect } from "next/navigation";
import { GenerateRoadmapButton } from "@/app/(app)/dashboard/generate-roadmap-button";

export const metadata: Metadata = {
  title: "Welcome",
};

export default async function OnboardingWelcomePage() {
  await requireUser();
  const state = await getAuthState();
  if (!state.user || !state.profile) {
    redirect("/onboarding");
  }

  const [entitlements, latestRoadmap] = await Promise.all([
    getEntitlements(state.user.id),
    getLatestRoadmapForUser(state.user.id),
  ]);
  const hasPaid = entitlements.isPro || entitlements.hasRoadmapUnlock;
  const hasRoadmap = latestRoadmap != null;

  if (hasRoadmap) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center gap-8 py-6 sm:py-10 max-w-lg mx-auto w-full">
      <Card className="w-full shadow-sm ring-1 ring-border/60">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">
            {hasPaid ? "You're all set" : "Profile saved"}
          </CardTitle>
          <CardDescription className="text-base">
            Next step: generate your free Phase 1 roadmap from your profile. It
            usually takes about a minute.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <GenerateRoadmapButton />
          {!hasPaid && (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-4 space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Optional upgrades</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>
                  <strong className="text-foreground">Roadmap Unlock</strong> —
                  all phases plus step tracking (one-time).
                </li>
                <li>
                  <strong className="text-foreground">Pro</strong> — time logs,
                  charts, recap emails, and more roadmaps.
                </li>
              </ul>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/pricing">Compare plans</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/settings">Upgrade in Settings</Link>
                </Button>
              </div>
              <p className="text-xs pt-1">
                You can upgrade anytime after creating your free Phase 1 roadmap.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="ghost" className="w-full min-h-[44px]">
            <Link href="/dashboard">Skip to dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
