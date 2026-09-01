"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateEmailPrefs } from "@/app/actions/updateEmailPrefs";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { appNestedSurfaceClass, appSectionLabelClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

export type EmailPrefs = {
  email_weekly_recap: boolean;
  email_inactivity_nudge: boolean;
  email_milestones: boolean;
};

type EmailPrefsSectionProps = {
  initialPrefs: EmailPrefs;
};

export function EmailPrefsSection({ initialPrefs }: EmailPrefsSectionProps) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<EmailPrefs>(initialPrefs);
  const [error, setError] = useState<string | null>(null);

  const submit = async (next: EmailPrefs) => {
    setError(null);
    setPrefs(next);
    const fd = new FormData();
    fd.set("email_weekly_recap", next.email_weekly_recap ? "on" : "off");
    fd.set("email_inactivity_nudge", next.email_inactivity_nudge ? "on" : "off");
    fd.set("email_milestones", next.email_milestones ? "on" : "off");
    const result = await updateEmailPrefs(fd);
    if (result.ok) router.refresh();
    else {
      setPrefs(initialPrefs);
      setError(result.error);
    }
  };

  const rows = [
    {
      id: "email_weekly_recap" as const,
      label: "Weekly recap",
      description: "One email per week with hours logged, steps completed, and a short encouragement.",
    },
    {
      id: "email_inactivity_nudge" as const,
      label: "Inactivity reminders",
      description: "A calm nudge if you have not logged time in 7 days. At most once every 14 days.",
    },
    {
      id: "email_milestones" as const,
      label: "Milestones",
      description: "A short email when you complete a full phase.",
    },
  ];

  return (
    <SettingsCard>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Nudges and recaps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {rows.map((row) => (
          <div
            key={row.id}
            className={cn(appNestedSurfaceClass, "flex items-center justify-between gap-4 px-4 py-3")}
          >
            <div className="grid gap-1 min-w-0">
              <Label htmlFor={row.id} className="text-sm font-semibold text-foreground">
                {row.label}
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">{row.description}</p>
            </div>
            <Checkbox
              id={row.id}
              checked={prefs[row.id]}
              onCheckedChange={(checked) => submit({ ...prefs, [row.id]: !!checked })}
              aria-label={`Toggle ${row.label}`}
            />
          </div>
        ))}
        <p className={appSectionLabelClass}>Changes save automatically</p>
      </CardContent>
    </SettingsCard>
  );
}
