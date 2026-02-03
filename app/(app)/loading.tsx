export default function AppLoading() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10 w-full min-h-0 animate-in fade-in duration-200">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-md bg-muted/70 animate-pulse" style={{ animationDelay: "100ms" }} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card h-[180px] animate-pulse" style={{ animationDelay: "150ms" }} />
        <div className="rounded-xl border border-border/60 bg-card h-[180px] animate-pulse" style={{ animationDelay: "200ms" }} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card h-[220px] animate-pulse" style={{ animationDelay: "250ms" }} />
        <div className="rounded-xl border border-border/60 bg-card h-[220px] animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
