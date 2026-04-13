"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoadmapGeneratingOverlay } from "@/components/loading/RoadmapGeneratingOverlay";
import { generateRoadmap, type GenerateRoadmapState } from "@/app/actions/generateRoadmap";

async function submitGenerateFromProfile(
  _prev: GenerateRoadmapState | null,
  formData: FormData
): Promise<GenerateRoadmapState> {
  return generateRoadmap(formData);
}

export function GenerateRoadmapButton() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(submitGenerateFromProfile, null);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.ok) {
      setClientError(null);
      router.push("/roadmap");
      return;
    }
    if (state && !state.ok) {
      setClientError(state.error);
      if (process.env.NODE_ENV !== "production") {
        console.error("[generateRoadmap] error:", state.error);
      }
    }
  }, [state, router]);

  return (
    <>
      {isPending && <RoadmapGeneratingOverlay />}
      <form
        action={formAction}
        className="flex flex-col gap-4"
        onSubmit={() => setClientError(null)}
      >
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" aria-hidden />
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">AI-proof module</span>
                <span className="text-xs font-medium text-muted-foreground">Optional</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Adds a final roadmap phase on verification, ownership, and portfolio proof for an
                AI-assisted workplace.
              </p>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="include_ai_proof_module"
                  value="on"
                  className="mt-0.5 size-4 shrink-0 rounded border-input"
                />
                <span>Include when generating from my profile</span>
              </label>
            </div>
          </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create roadmap"}
        </Button>
        {clientError && (
          <p className="text-sm text-destructive" role="alert">
            {clientError}
          </p>
        )}
      </form>
    </>
  );
}
