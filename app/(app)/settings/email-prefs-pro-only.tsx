import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsCard } from "@/components/settings/SettingsCard";

type EmailPrefsProOnlyProps = {
  isPro: boolean;
};

export function EmailPrefsProOnly({ isPro }: EmailPrefsProOnlyProps) {
  if (isPro) return null;

  return (
    <SettingsCard className="bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">Available with Pro</CardTitle>
        <CardDescription>
          Weekly recap, inactivity nudges, and milestone emails are included with Pro.
          Upgrade below to manage these preferences from Settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Pro includes weekly recap, gentle inactivity reminders, and emails when you
          complete a phase.
        </p>
      </CardContent>
    </SettingsCard>
  );
}
