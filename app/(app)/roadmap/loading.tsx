import { appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export default function RoadmapLoading() {
  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in duration-200">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 rounded-xl bg-muted animate-pulse" />
        <div
          className="h-4 w-56 rounded-xl bg-muted/70 animate-pulse"
          style={{ animationDelay: "80ms" }}
        />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(appSurfaceCardClass, "overflow-hidden p-0")}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
              <div className="h-5 w-32 rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded-lg bg-muted/70 animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2.5"
                >
                  <div className="h-5 w-5 shrink-0 rounded border border-border bg-background" />
                  <div className="h-4 flex-1 max-w-[200px] rounded-lg bg-muted/60 animate-pulse" />
                  <div className="h-4 w-12 rounded-lg bg-muted/60 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
