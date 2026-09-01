import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAuthState, requireUser } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getLatestRoadmapForUser } from "@/lib/server/db/roadmaps";
import { redirect } from "next/navigation";
import { GenerateRoadmapButton } from "@/app/(app)/dashboard/generate-roadmap-button";
import { appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-8 py-6 sm:py-10 max-w-lg mx-auto w-full">
      <PageHeader
        eyebrow="Next step"
        title={hasPaid ? "You're all set" : "Profile saved"}
        subtitle="Build your free Phase 1 roadmap from your profile. It usually takes about a minute."
      />
      <div className={cn(appSurfaceCardClass, "p-6 sm:p-8 space-y-6")}>
        <GenerateRoadmapButton />
        {!hasPaid ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Want the full plan later?{" "}
            <Link
              href="/pricing"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Compare plans
            </Link>{" "}
            or upgrade in Settings after your roadmap is ready.
          </p>
        ) : null}
        <Button asChild variant="ghost" className="w-full min-h-11 rounded-full">
          <Link href="/dashboard">Skip to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
