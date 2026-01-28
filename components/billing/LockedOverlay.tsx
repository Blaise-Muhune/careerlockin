"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        "flex flex-col items-center justify-center gap-3 rounded-lg border bg-card/80 px-4 py-5 text-center shadow-sm backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground text-[11px] font-medium uppercase tracking-wide">
        <Lock className="size-4" aria-hidden />
        <span>Locked preview</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground max-w-sm">{body}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        {primaryCtaLabel &&
          (hasPrimaryLink ? (
            <Button size="sm" asChild>
              <Link href={primaryHref!}>{primaryCtaLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={onPrimaryCta}>
              {primaryCtaLabel}
            </Button>
          ))}
        {secondaryCtaLabel &&
          (hasSecondaryLink ? (
            <Button size="sm" variant="secondary" asChild>
              <Link href={secondaryHref!}>{secondaryCtaLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={onSecondaryCta}>
              {secondaryCtaLabel}
            </Button>
          ))}
      </div>
    </div>
  );
}

