import { requireUserAndProfile } from "@/lib/server/auth";
import {
  getEntitlements,
  getSubscriptionDetails,
  getProEndedForBanner,
} from "@/lib/server/billing/entitlements";
import { getEmailPrefs, getProfileForSettings } from "@/lib/server/db/profiles";
import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";
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
import { CreateNewRoadmapLink } from "./create-new-roadmap-link";
import { EmailPrefsSection } from "./email-prefs-section";
import { EmailPrefsProOnly } from "./email-prefs-pro-only";
import { PurchaseSuccessRevalidate } from "./purchase-success-revalidate";
import { SettingsAlerts } from "./settings-alerts";
import { ProfileEditForm } from "./profile-edit-form";
import { DeleteRoadmapSection } from "./delete-roadmap-section";
import { DeleteAccountSection } from "./delete-account-section";

type SettingsPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { userId } = await requireUserAndProfile();
  const params = await searchParams;
  const unlockSuccess = params.unlock === "success";
  const proSuccess = params.pro === "success";
  const fromPortal = params.from_portal === "1";
  const source =
    typeof params.source === "string" ? params.source : null;

  const [
    entitlements,
    emailPrefs,
    subscriptionDetails,
    proEnded,
    profile,
    roadmaps,
  ] = await Promise.all([
    getEntitlements(userId),
    getEmailPrefs(userId),
    getSubscriptionDetails(userId),
    getProEndedForBanner(userId),
    getProfileForSettings(userId),
    listRoadmapsForUser(userId),
  ]);

  const badgeVariant = planBadgeVariantFromEntitlements(entitlements);
  const summary = entitlementSummaryFromEntitlements(entitlements);

  const cancelAtPeriodEnd = subscriptionDetails?.cancel_at_period_end ?? null;
  const periodEndFormatted = cancelAtPeriodEnd
    ? formatDate(cancelAtPeriodEnd)
    : null;
  const hasCancelAtPeriodEnd = Boolean(cancelAtPeriodEnd);

  return (
    <div className="flex flex-col gap-10">
      <PurchaseSuccessRevalidate
        shouldRevalidate={unlockSuccess || proSuccess || fromPortal}
      />
      <PageHeader
        title="Settings"
        subtitle="Manage your account and plan."
      />
      <SettingsAlerts
        unlockSuccess={unlockSuccess}
        proSuccess={proSuccess}
        fromPortal={fromPortal}
        cancelAtPeriodEnd={periodEndFormatted}
        proEnded={proEnded}
        source={source}
      />
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
      {profile && <ProfileEditForm profile={profile} />}
      <DeleteRoadmapSection roadmaps={roadmaps} />
      {entitlements.isPro && (
        <CreateNewRoadmapLink userId={userId} />
      )}
      {entitlements.isPro && emailPrefs ? (
        <EmailPrefsSection initialPrefs={emailPrefs} />
      ) : (
        <EmailPrefsProOnly isPro={entitlements.isPro} />
      )}
      <UnlockOptions
        entitlements={entitlements}
        cancelAtPeriodEnd={hasCancelAtPeriodEnd}
      />
      <DeleteAccountSection />
    </div>
  );
}
