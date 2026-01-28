import { requireUserAndProfile } from "@/lib/server/auth";
import { getEntitlements } from "@/lib/server/billing/entitlements";
import { getEmailPrefs } from "@/lib/server/db/profiles";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  PlanBadge,
  planBadgeVariantFromEntitlements,
} from "@/components/billing/PlanBadge";
import {
  EntitlementSummary,
  entitlementSummaryFromEntitlements,
} from "@/components/billing/EntitlementSummary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UnlockOptions } from "./unlock-options";
import { EmailPrefsSection } from "./email-prefs-section";
import { EmailPrefsProOnly } from "./email-prefs-pro-only";
import { PurchaseSuccessRevalidate } from "./purchase-success-revalidate";

type SettingsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { userId } = await requireUserAndProfile();
  const params = await searchParams;
  const unlockSuccess = params.unlock === "success";
  const proSuccess = params.pro === "success";

  const [entitlements, emailPrefs] = await Promise.all([
    getEntitlements(userId),
    getEmailPrefs(userId),
  ]);

  const badgeVariant = planBadgeVariantFromEntitlements(entitlements);
  const summary = entitlementSummaryFromEntitlements(entitlements);

  return (
    <div className="flex flex-col gap-10">
      <PurchaseSuccessRevalidate shouldRevalidate={unlockSuccess || proSuccess} />
      <PageHeader
        title="Settings"
        subtitle="Manage your account and plan."
      />
      {(unlockSuccess || proSuccess) && (
        <p className="text-sm text-primary font-medium" role="status">
          {unlockSuccess && proSuccess
            ? "Purchase complete. Your plan has been updated."
            : unlockSuccess
              ? "Full roadmap unlocked. You now have access to all phases and steps."
              : "Pro active. You now have tracking, time logs, and insights."}
        </p>
      )}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Your access</h2>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PlanBadge variant={badgeVariant} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EntitlementSummary
              roadmapDetails={summary.roadmapDetails}
              tracking={summary.tracking}
              insights={summary.insights}
            />
          </CardContent>
        </Card>
      </section>
      {entitlements.isPro && emailPrefs ? (
        <EmailPrefsSection initialPrefs={emailPrefs} />
      ) : (
        <EmailPrefsProOnly isPro={entitlements.isPro} />
      )}
      <UnlockOptions entitlements={entitlements} />
    </div>
  );
}
