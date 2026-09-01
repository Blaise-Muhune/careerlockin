import Link from "next/link";
import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { appMonoStatClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const PRO_ROADMAP_LIMIT = 5;

type CreateNewRoadmapLinkProps = {
  userId: string;
};

export async function CreateNewRoadmapLink({ userId }: CreateNewRoadmapLinkProps) {
  const roadmaps = await listRoadmapsForUser(userId);
  if (roadmaps.length >= PRO_ROADMAP_LIMIT) return null;

  return (
    <SettingsCard>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Create another roadmap</CardTitle>
        <CardDescription>
          Pro includes up to {PRO_ROADMAP_LIMIT} roadmaps. You have{" "}
          <span className={cn("font-semibold text-foreground", appMonoStatClass)}>
            {roadmaps.length}
          </span>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/roadmaps/new">
            <Plus className="size-4 mr-2" aria-hidden />
            Create another roadmap
          </Link>
        </Button>
      </CardContent>
    </SettingsCard>
  );
}
