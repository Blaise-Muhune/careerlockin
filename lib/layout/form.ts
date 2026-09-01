import { cn } from "@/lib/utils";
import { appNestedSurfaceClass } from "./app";

export const formInputClass = "h-11 rounded-xl text-base";

export const formSelectClass =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50";

export const formTextareaClass =
  "flex w-full rounded-xl border border-input bg-transparent px-4 py-3 text-base shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 resize-y min-h-[100px]";

export const formChipClass =
  "rounded-full border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted/50 transition-colors min-h-11 touch-manipulation";

export const formChipSelectedClass =
  "rounded-full border border-foreground/20 bg-foreground px-4 py-2.5 text-sm font-semibold text-background shadow-sm min-h-11 touch-manipulation";

export function formGoalTileClass(selected: boolean): string {
  return cn(
    appNestedSurfaceClass,
    "flex flex-col items-center justify-center gap-2 px-4 py-5 min-h-[4.5rem] cursor-pointer transition-all text-center touch-manipulation",
    selected
      ? "border-foreground/20 bg-foreground/[0.04] ring-1 ring-foreground/10 text-foreground"
      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
  );
}

export const formLearningPrefClass =
  "flex items-center gap-3 rounded-xl border border-border/60 bg-muted/15 px-4 py-3 min-h-12 cursor-pointer transition-colors hover:bg-muted/30 has-[:checked]:border-foreground/20 has-[:checked]:bg-foreground/[0.04] has-[:checked]:ring-1 has-[:checked]:ring-foreground/10 touch-manipulation";

export const formAiProofModuleClass = cn(appNestedSurfaceClass, "p-5");

export const formAiProofModuleTitle = "Extra phase";
export const formAiProofModuleDescription =
  "Adds one section at the end: prove your work with portfolio pieces and decisions employers can trust.";
export const formAiProofModuleCheckboxLabel = "Add this phase";
export const formAiProofModuleRegenCheckboxLabel = "Add this phase to the new roadmap";
