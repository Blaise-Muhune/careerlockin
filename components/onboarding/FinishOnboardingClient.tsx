"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { submitOnboarding } from "@/app/actions/onboarding";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
} from "@/lib/onboarding/draft-storage";
import { draftToFormData } from "@/lib/onboarding/schema";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export function FinishOnboardingClient() {
  const router = useRouter();
  const submitted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    async function run() {
      const draft = readOnboardingDraft();
      if (!draft?.target_role?.trim()) {
        router.replace("/get-started");
        return;
      }

      const formData = draftToFormData(draft);
      const result = await submitOnboarding(null, formData);
      if (result?.error) {
        setError(result.error);
        submitted.current = false;
        return;
      }
      clearOnboardingDraft();
    }

    void run();
  }, [router]);

  return (
    <AuthPageShell width="narrow">
      <div className={cn(appSurfaceCardClass, "p-10 sm:p-12 text-center space-y-5")}>
        {error ? (
          <>
            <AuthMessage>{error}</AuthMessage>
            <button
              type="button"
              className="text-sm text-primary font-medium underline-offset-4 hover:underline"
              onClick={() => router.push("/get-started")}
            >
              Back to setup
            </button>
          </>
        ) : (
          <>
            <Loader2
              className="size-8 mx-auto text-primary animate-spin motion-reduce:animate-none"
              aria-hidden
            />
            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">Saving your profile</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                One moment — then we&apos;ll take you to roadmap setup.
              </p>
            </div>
          </>
        )}
      </div>
    </AuthPageShell>
  );
}
