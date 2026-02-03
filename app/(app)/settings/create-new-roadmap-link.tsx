import Link from "next/link";
import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const PRO_ROADMAP_LIMIT = 5;

type CreateNewRoadmapLinkProps = {
  userId: string;
};

export async function CreateNewRoadmapLink({ userId }: CreateNewRoadmapLinkProps) {
  const roadmaps = await listRoadmapsForUser(userId);
  if (roadmaps.length >= PRO_ROADMAP_LIMIT) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Roadmaps</h2>
      <p className="text-sm text-muted-foreground">
        Pro includes up to {PRO_ROADMAP_LIMIT} roadmaps. You have {roadmaps.length}.
      </p>
      <Button asChild variant="outline" size="sm">
        <Link href="/roadmaps/new">
          <Plus className="size-4 mr-2" aria-hidden />
          Create new roadmap
        </Link>
      </Button>
    </section>
  );
}
