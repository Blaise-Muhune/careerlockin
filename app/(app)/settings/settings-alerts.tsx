"use client";

import { CheckCircle2, Info, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SettingsAlertsProps = {
  unlockSuccess: boolean;
  proSuccess: boolean;
  fromPortal: boolean;
  cancelAtPeriodEnd: string | null;
  /** When true, user's Pro subscription has ended; show banner to resubscribe. */
  proEnded?: boolean;
};

export function SettingsAlerts({
  unlockSuccess,
  proSuccess,
  fromPortal,
  cancelAtPeriodEnd,
  proEnded = false,
}: SettingsAlertsProps) {
  const hasSuccess = unlockSuccess || proSuccess;
  const hasAny = hasSuccess || fromPortal || cancelAtPeriodEnd || proEnded;

  if (!hasAny) return null;

  return (
    <div className="flex flex-col gap-3" role="region" aria-label="Plan status and updates">
      {hasSuccess && (
        <div
          className={cn(
            "rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-4 sm:px-5 sm:py-4",
            "flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3"
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3 shrink-0">
            <CheckCircle2
              className="size-5 sm:size-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
              aria-hidden
            />
            <div className="flex flex-col gap-1 text-sm">
              {unlockSuccess && proSuccess ? (
                <>
                  <p className="font-semibold text-foreground">
                    Purchase complete
                  </p>
                  <p className="text-muted-foreground">
                    Your plan has been updated. You have full roadmap access and Pro (tracking, time logs, insights).
                  </p>
                </>
              ) : unlockSuccess ? (
                <>
                  <p className="font-semibold text-foreground">
                    Full roadmap unlocked
                  </p>
                  <p className="text-muted-foreground">
                    You now have access to all phases, steps, and resources.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-foreground">
                    Pro is active
                  </p>
                  <p className="text-muted-foreground">
                    You now have tracking, time logs, charts, and insights.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {fromPortal && !hasSuccess && (
        <div
          className="rounded-xl border border-border bg-muted/30 px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3"
          role="status"
        >
          <Info className="size-5 text-muted-foreground shrink-0" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Billing updated. If you canceled Pro, you&apos;ll keep Pro access until the end of your billing period.
          </p>
        </div>
      )}

      {cancelAtPeriodEnd && (
        <div
          className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3"
          role="status"
        >
          <Calendar
            className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">
              Pro subscription canceled
            </p>
            <p className="text-muted-foreground">
              You&apos;ll keep Pro access until <strong className="text-foreground">{cancelAtPeriodEnd}</strong>. After that, tracking and insights will be locked until you resubscribe.
            </p>
          </div>
        </div>
      )}

      {proEnded && (
        <div
          className="rounded-xl border border-primary/30 bg-primary/10 dark:bg-primary/5 px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3"
          role="status"
        >
          <Sparkles
            className="size-5 text-primary shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-foreground">
              Your Pro subscription has ended
            </p>
            <p className="text-muted-foreground">
              Resubscribe to Pro or unlock the full roadmap with a one-time purchase below to get tracking and insights back.
            </p>
            <Link
              href="#unlock-options"
              className="text-primary font-medium hover:underline underline-offset-2 text-left w-fit"
            >
              See options below →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
