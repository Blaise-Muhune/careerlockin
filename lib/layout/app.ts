/** Shared layout tokens for authenticated app surfaces. */
export const appContainerClass =
  "mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl min-w-0";

export const appSurfaceCardClass =
  "rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-10px_rgba(0,0,0,0.08)]";

export const appSidebarClass =
  "hidden lg:flex w-[15.5rem] shrink-0 flex-col border-r border-border/50 bg-card/90 backdrop-blur-sm sticky top-0 h-[100dvh] self-start";

export const appNavItemClass =
  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

export const appNavItemActiveClass = "bg-muted text-foreground";

export const appNavItemInactiveClass =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export const appEyebrowClass =
  "text-xs font-semibold uppercase tracking-[0.14em] text-primary";

export const appPageTitleClass =
  "text-2xl sm:text-3xl font-bold tracking-tight text-foreground";

export const appMonoStatClass = "font-mono tabular-nums";

export const appSectionLabelClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export const appAuthCardClass =
  "w-full border-border/60 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_40px_-16px_rgba(0,0,0,0.12)]";

export const appPrimaryButtonClass =
  "rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200";

export const appNestedSurfaceClass =
  "rounded-xl border border-border/60 bg-muted/20";

/** Role bar + skill pills (marketing + app roadmap header). */
export const roadmapRoleBarClass =
  "flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl border border-border/70 bg-background px-3 py-3 sm:px-4 min-w-0";

export const roadmapSkillPillClass =
  "rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium text-primary";

/** Compact step row pill (checkbox + title + status icon). */
export const roadmapStepPillClass =
  "flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3.5 min-h-[3.25rem] transition-colors touch-manipulation";
