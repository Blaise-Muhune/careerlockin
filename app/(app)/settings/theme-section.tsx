"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { ThemeToggle } from "@/components/theme-toggle";
import { appNestedSurfaceClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export function ThemeSection() {
  return (
    <SettingsCard>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Color theme</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div
          className={cn(
            appNestedSurfaceClass,
            "flex items-center justify-between gap-4 px-4 py-3"
          )}
        >
          <div className="grid gap-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Light or dark mode</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose how CareerLockin looks on this device.
            </p>
          </div>
          <ThemeToggle />
        </div>
      </CardContent>
    </SettingsCard>
  );
}
