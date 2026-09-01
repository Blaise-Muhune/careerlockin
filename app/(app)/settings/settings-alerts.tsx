"use client";

import { CheckCircle2, Info, Calendar } from "lucide-react";
import Link from "next/link";
import { appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type SettingsAlertsProps = {
  unlockSuccess: boolean;
  proSuccess: boolean;
  fromPortal: boolean;
  cancelAtPeriodEnd: string | null;
  /** When true, user's Pro subscription has ended; show banner to resubscribe. */
  proEnded?: boolean;
  source?: string | null;
};

const alertBaseClass = cn(appSurfaceCardClass, "px-4 py-4 sm:px-5 flex items-start gap-3");

export function SettingsAlerts({
  unlockSuccess,
  proSuccess,
  fromPortal,
  cancelAtPeriodEnd,
  proEnded = false,
  source = null,
}: SettingsAlertsProps) {
  const hasSuccess = unlockSuccess || proSuccess;
  const hasRedirectNotice =
    source === "locked_roadmap" || source === "create_roadmap_requires_pro";
  const hasAny =
    hasSuccess || fromPortal || cancelAtPeriodEnd || proEnded || hasRedirectNotice;

  if (!hasAny) return null;

  return (
    <div className="flex flex-col gap-3" role="region" aria-label="Plan status and updates">
      {hasSuccess && (
        <div
          className={cn(
            alertBaseClass,
            "border-green-500/30 bg-green-500/[0.06] dark:bg-green-500/10"
          )}
          role="status"
          aria-live="polite"
        >
          <CheckCircle2
            className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex flex-col gap-1 text-sm min-w-0">
            {unlockSuccess && proSuccess ? (
              <>
                <p className="font-bold text-foreground">Purchase complete</p>
                <p className="text-muted-foreground leading-relaxed">
                  Your plan has been updated. You have full roadmap access and Pro (tracking,
                  time logs, insights).
                </p>
              </>
            ) : unlockSuccess ? (
              <>
                <p className="font-bold text-foreground">Full roadmap unlocked</p>
                <p className="text-muted-foreground leading-relaxed">
                  You now have access to all phases, steps, and resources.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-foreground">Pro is active</p>
                <p className="text-muted-foreground leading-relaxed">
                  You now have tracking, time logs, charts, and insights.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {fromPortal && !hasSuccess && (
        <div className={alertBaseClass} role="status">
          <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Billing updated. If you canceled Pro, you&apos;ll keep Pro access until the end of
            your billing period.
          </p>
        </div>
      )}

      {source === "locked_roadmap" && (
        <div className={alertBaseClass} role="status">
          <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Phase 1 is available on Free. Upgrade here to unlock all roadmap phases and advanced
            tracking.
          </p>
        </div>
      )}

      {source === "create_roadmap_requires_pro" && (
        <div className={alertBaseClass} role="status">
          <Info className="size-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Creating additional roadmaps is a Pro feature. Upgrade to Pro below to continue.
          </p>
        </div>
      )}

      {cancelAtPeriodEnd && (
        <div
          className={cn(
            alertBaseClass,
            "border-amber-500/30 bg-amber-500/[0.06] dark:bg-amber-500/10"
          )}
          role="status"
        >
          <Calendar
            className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex flex-col gap-1 text-sm min-w-0">
            <p className="font-bold text-foreground">Pro subscription canceled</p>
            <p className="text-muted-foreground leading-relaxed">
              You&apos;ll keep Pro access until{" "}
              <strong className="text-foreground">{cancelAtPeriodEnd}</strong>. After that,
              tracking and insights will be locked until you resubscribe.
            </p>
          </div>
        </div>
      )}

      {proEnded && (
        <div
          className={cn(
            alertBaseClass,
            "border-primary/30 bg-primary/[0.04] dark:bg-primary/10"
          )}
          role="status"
        >
          <Info className="size-5 text-primary shrink-0 mt-0.5" aria-hidden />
          <div className="flex flex-col gap-2 text-sm min-w-0">
            <p className="font-bold text-foreground">Your Pro subscription has ended</p>
            <p className="text-muted-foreground leading-relaxed">
              Resubscribe to Pro or unlock the full roadmap with a one-time purchase below to
              get tracking and insights back.
            </p>
            <Link
              href="#unlock-options"
              className="text-primary font-semibold hover:underline underline-offset-4 w-fit"
            >
              See options below
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
