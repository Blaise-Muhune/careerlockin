"use client";

import Link from "next/link";
import { BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChartsLockedPlaceholderProps = {
  className?: string;
};

export function ChartsLockedPlaceholder({ className }: ChartsLockedPlaceholderProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed bg-muted/30 px-6 py-10 flex flex-col items-center justify-center gap-4 text-center",
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <BarChart3 className="size-5" aria-hidden />
        <Lock className="size-4" aria-hidden />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Charts & insights</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Upgrade to Pro to see weekly trends, phase completion, and detailed insights.
        </p>
      </div>
      <Button size="sm" asChild>
        <Link href="/settings">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
