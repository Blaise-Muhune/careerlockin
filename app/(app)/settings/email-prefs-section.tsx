"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateEmailPrefs } from "@/app/actions/updateEmailPrefs";

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

  const submit = async (next: EmailPrefs) => {
    setPrefs(next);
    const fd = new FormData();
    fd.set("email_weekly_recap", next.email_weekly_recap ? "on" : "off");
    fd.set("email_inactivity_nudge", next.email_inactivity_nudge ? "on" : "off");
    fd.set("email_milestones", next.email_milestones ? "on" : "off");
    const result = await updateEmailPrefs(fd);
    if (result.ok) router.refresh();
    else setPrefs(initialPrefs);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Email preferences</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Nudges and recaps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email_weekly_recap" className="text-sm font-normal">
                Weekly recap
              </Label>
              <p className="text-xs text-muted-foreground">
                One email per week with hours logged, steps completed, and a short encouragement.
              </p>
            </div>
            <Checkbox
              id="email_weekly_recap"
              checked={prefs.email_weekly_recap}
              onCheckedChange={(checked) =>
                submit({ ...prefs, email_weekly_recap: !!checked })
              }
              aria-label="Toggle weekly recap"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email_inactivity_nudge" className="text-sm font-normal">
                Inactivity reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                A calm nudge if you haven&apos;t logged time in 7 days. At most once every 14 days.
              </p>
            </div>
            <Checkbox
              id="email_inactivity_nudge"
              checked={prefs.email_inactivity_nudge}
              onCheckedChange={(checked) =>
                submit({ ...prefs, email_inactivity_nudge: !!checked })
              }
              aria-label="Toggle inactivity reminders"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email_milestones" className="text-sm font-normal">
                Milestones
              </Label>
              <p className="text-xs text-muted-foreground">
                A short email when you complete a full phase.
              </p>
            </div>
            <Checkbox
              id="email_milestones"
              checked={prefs.email_milestones}
              onCheckedChange={(checked) =>
                submit({ ...prefs, email_milestones: !!checked })
              }
              aria-label="Toggle milestone emails"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
