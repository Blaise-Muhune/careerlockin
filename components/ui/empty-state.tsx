import type { ReactNode } from "react";

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
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description != null && description !== "" && (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action != null && <div className="mt-1">{action}</div>}
    </div>
  );
}
