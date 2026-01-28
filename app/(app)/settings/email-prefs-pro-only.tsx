import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmailPrefsProOnlyProps = {
  isPro: boolean;
};

/**
 * Shown when the user is not on Pro: email preferences (weekly recap, inactivity
 * nudges, milestones) are Pro-only. Renders nothing when isPro so the section
 * is omitted in edge cases (e.g. Pro but email prefs not available).
 */
export function EmailPrefsProOnly({ isPro }: EmailPrefsProOnlyProps) {
  if (isPro) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-foreground">Email preferences</h2>
      <Card className="border-muted bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Available with Pro
          </CardTitle>
          <CardDescription>
            Weekly recap, inactivity nudges, and milestone emails are available
            with a Pro subscription. Upgrade below to manage these preferences
            from Settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pro includes: weekly recap, gentle inactivity reminders, and emails
            when you complete a phase.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
