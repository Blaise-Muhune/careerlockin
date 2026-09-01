import { redirect } from "next/navigation";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewRoadmapForm } from "./new-roadmap-form";
import { appMonoStatClass, appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const PRO_ROADMAP_LIMIT = 5;

export default async function NewRoadmapPage() {
  const { userId } = await requireUserAndProfile();
  const [entitlements, roadmaps] = await Promise.all([
    getEntitlements(userId),
    listRoadmapsForUser(userId),
  ]);

  if (!entitlements.isPro) {
    redirect("/settings?source=create_roadmap_requires_pro");
  }

  if (roadmaps.length >= PRO_ROADMAP_LIMIT) {
    redirect("/roadmap?source=roadmap_limit_reached");
  }

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-2xl mx-auto w-full">
      <PageHeader
        eyebrow="Pro"
        title="What do you want to build next?"
        subtitle="Tell us about this goal and we'll map phases, steps, and curated resources."
        action={
          <span
            className={cn(
              "inline-flex items-center rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-xs font-semibold text-muted-foreground",
              appMonoStatClass
            )}
          >
            {roadmaps.length} of {PRO_ROADMAP_LIMIT} roadmaps
          </span>
        }
      />
      <div className={cn(appSurfaceCardClass, "p-6 sm:p-8")}>
        <NewRoadmapForm />
      </div>
    </div>
  );
}
