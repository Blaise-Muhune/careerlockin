import { redirect } from "next/navigation";
import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";
import { NewRoadmapForm } from "./new-roadmap-form";

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
    <div className="flex flex-col gap-8 sm:gap-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Create another roadmap
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          What do you want to build next?
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Tell us about this goal and we&apos;ll create a personalized roadmap with phases, steps, and real resources.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {roadmaps.length} of {PRO_ROADMAP_LIMIT} roadmaps
          </span>
        </div>
      </div>
      <NewRoadmapForm />
    </div>
  );
}
