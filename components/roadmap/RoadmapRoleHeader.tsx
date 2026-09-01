import {
  appSurfaceCardClass,
  roadmapRoleBarClass,
  roadmapSkillPillClass,
} from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type RoadmapRoleHeaderProps = {
  targetRole: string;
  skills?: string[] | null;
  showActiveDot?: boolean;
  className?: string;
  embedded?: boolean;
};

export function RoadmapRoleHeader({
  targetRole,
  skills,
  showActiveDot = true,
  className,
  embedded = false,
}: RoadmapRoleHeaderProps) {
  const pills = (skills ?? []).filter(Boolean).slice(0, 8);

  return (
    <div
      className={cn(
        embedded ? "space-y-4" : cn(appSurfaceCardClass, "space-y-4 p-5"),
        className
      )}
    >
      <div className={roadmapRoleBarClass}>
        <span className="font-medium text-muted-foreground" aria-hidden>
          #
        </span>
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground text-sm sm:text-base">{targetRole}</span>
        {showActiveDot ? (
          <span
            className="size-2 shrink-0 rounded-full bg-primary motion-safe:animate-pulse sm:ml-auto"
            aria-hidden
          />
        ) : null}
      </div>
      {pills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {pills.map((skill) => (
            <span key={skill} className={roadmapSkillPillClass}>
              {skill}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
