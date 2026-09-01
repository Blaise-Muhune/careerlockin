"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  appEyebrowClass,
  appPrimaryButtonClass,
  appSurfaceCardClass,
} from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export type LockedOverlayProps = {
  className?: string;
  title: string;
  body: string;
  primaryCtaLabel: string;
  primaryHref?: string;
  onPrimaryCta?: () => void;
  secondaryCtaLabel?: string;
  secondaryHref?: string;
  onSecondaryCta?: () => void;
};

export function LockedOverlay({
  className,
  title,
  body,
  primaryCtaLabel,
  primaryHref,
  onPrimaryCta,
  secondaryCtaLabel,
  secondaryHref,
  onSecondaryCta,
}: LockedOverlayProps) {
  const hasPrimaryLink = !!primaryHref;
  const hasSecondaryLink = !!secondaryHref;

  return (
    <div
      className={cn(
        appSurfaceCardClass,
        "flex flex-col items-center justify-center gap-3 px-5 py-6 text-center backdrop-blur-sm",
        className
      )}
    >
      <div className={cn("flex items-center justify-center gap-2", appEyebrowClass)}>
        <Lock className="size-3.5" aria-hidden />
        <span>Locked preview</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        {primaryCtaLabel &&
          (hasPrimaryLink ? (
            <Button size="sm" asChild className={cn("rounded-full", appPrimaryButtonClass)}>
              <Link href={primaryHref!}>{primaryCtaLabel}</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onPrimaryCta}
              className={cn("rounded-full", appPrimaryButtonClass)}
            >
              {primaryCtaLabel}
            </Button>
          ))}
        {secondaryCtaLabel &&
          (hasSecondaryLink ? (
            <Button size="sm" variant="outline" asChild className="rounded-full">
              <Link href={secondaryHref!}>{secondaryCtaLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onSecondaryCta} className="rounded-full">
              {secondaryCtaLabel}
            </Button>
          ))}
      </div>
    </div>
  );
}
