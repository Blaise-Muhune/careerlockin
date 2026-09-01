import type { ReactNode } from "react";
import { appSurfaceCardClass } from "@/lib/layout/app";

type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  title = "Nothing here yet",
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={`${appSurfaceCardClass} flex flex-col items-center justify-center gap-3 px-6 py-14 text-center`}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
        <div className="size-5 rounded-full border-2 border-muted-foreground/25" aria-hidden />
      </div>
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description != null && description !== "" ? (
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      ) : null}
      {action != null ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
