import { appMonoStatClass } from "@/lib/layout/app";
import { marketingFeatureCardClass } from "@/lib/layout/marketing";
import { cn } from "@/lib/utils";

const comparisonRows = [
  {
    capability: "Your roadmap",
    free: "Yes",
    unlock: "Yes",
    pro: "Yes (up to 5)",
    mono: false,
  },
  {
    capability: "Phase 1 content",
    free: "Full",
    unlock: "Full",
    pro: "Full",
    mono: false,
  },
  {
    capability: "Later phases and resources",
    free: "Preview",
    unlock: "Full",
    pro: "Full",
    mono: false,
  },
  {
    capability: "Step tracking",
    free: "Phase 1 only",
    unlock: "All phases",
    pro: "All phases",
    mono: false,
  },
  {
    capability: "Time logs and charts",
    free: "No",
    unlock: "No",
    pro: "Yes",
    mono: true,
  },
  {
    capability: "Roadmap refreshes",
    free: "1",
    unlock: "1",
    pro: "3",
    mono: true,
  },
  {
    capability: "Recap / milestone emails",
    free: "No",
    unlock: "No",
    pro: "Yes",
    mono: true,
  },
] as const;

function PlanValue({ value, mono }: { value: string; mono: boolean }) {
  return (
    <span className={cn("text-sm text-muted-foreground", mono && appMonoStatClass)}>
      {value}
    </span>
  );
}

export function PlanComparisonTable() {
  return (
    <div className={cn(marketingFeatureCardClass, "overflow-hidden p-0")}>
      {/* Mobile: stacked rows — no horizontal scroll */}
      <div className="md:hidden divide-y divide-border/50">
        {comparisonRows.map((row) => (
          <div key={row.capability} className="p-4 sm:p-5">
            <p className="font-semibold text-foreground text-base mb-3">{row.capability}</p>
            <dl className="grid grid-cols-3 gap-3">
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Free
                </dt>
                <dd>
                  <PlanValue value={row.free} mono={row.mono} />
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Unlock
                </dt>
                <dd>
                  <PlanValue value={row.unlock} mono={row.mono} />
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Pro
                </dt>
                <dd>
                  <PlanValue value={row.pro} mono={row.mono} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Desktop: full table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="p-4 font-bold text-foreground">Capability</th>
              <th className="p-4 font-bold text-foreground">Free</th>
              <th className="p-4 font-bold text-foreground">Unlock</th>
              <th className="p-4 font-bold text-foreground">Pro</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {comparisonRows.map((row) => (
              <tr
                key={row.capability}
                className={row.capability === comparisonRows[comparisonRows.length - 1]!.capability ? "" : "border-b border-border/40"}
              >
                <td className="p-4 font-medium text-foreground">{row.capability}</td>
                <td className={cn("p-4", row.mono && appMonoStatClass)}>{row.free}</td>
                <td className={cn("p-4", row.mono && appMonoStatClass)}>{row.unlock}</td>
                <td className="p-4">{row.pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
