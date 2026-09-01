import { requireUserAndProfile } from "@/lib/server/auth";

import {

  getEntitlements,

  getSubscriptionDetails,

  getProEndedForBanner,

} from "@/lib/server/billing/entitlements";

import { getEmailPrefs, getProfileForSettings } from "@/lib/server/db/profiles";

import { listRoadmapsForUser } from "@/lib/server/db/roadmaps";

import { PageHeader } from "@/components/layout/PageHeader";

import { AppSection } from "@/components/layout/AppSection";

import {

  PlanBadge,

  planBadgeVariantFromEntitlements,

} from "@/components/billing/PlanBadge";

import {

  EntitlementSummary,

  entitlementSummaryFromEntitlements,

} from "@/components/billing/EntitlementSummary";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SettingsCard } from "@/components/settings/SettingsCard";

import { UnlockOptions } from "./unlock-options";

import { CreateNewRoadmapLink } from "./create-new-roadmap-link";

import { EmailPrefsSection } from "./email-prefs-section";

import { EmailPrefsProOnly } from "./email-prefs-pro-only";

import { PurchaseSuccessRevalidate } from "./purchase-success-revalidate";

import { SettingsAlerts } from "./settings-alerts";

import { ProfileEditForm } from "./profile-edit-form";

import { DeleteRoadmapSection } from "./delete-roadmap-section";

import { DeleteAccountSection } from "./delete-account-section";
import { ThemeSection } from "./theme-section";



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

  const source = typeof params.source === "string" ? params.source : null;



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

  const periodEndFormatted = cancelAtPeriodEnd ? formatDate(cancelAtPeriodEnd) : null;

  const hasCancelAtPeriodEnd = Boolean(cancelAtPeriodEnd);



  return (

    <div className="flex flex-col gap-10">

      <PurchaseSuccessRevalidate

        shouldRevalidate={unlockSuccess || proSuccess || fromPortal}

      />

      <PageHeader

        eyebrow="Account"

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



      <AppSection eyebrow="Plan" title="Your access">

        <div id="unlock-options" className="grid gap-6 lg:grid-cols-2 lg:items-start">

          <SettingsCard>

            <CardHeader className="pb-3">

              <CardTitle className="text-lg font-bold flex items-center gap-2">

                <PlanBadge variant={badgeVariant} />

              </CardTitle>

            </CardHeader>

            <CardContent className="pt-0">

              <EntitlementSummary

                roadmapDetails={summary.roadmapDetails}

                tracking={summary.tracking}

                insights={summary.insights}

              />

            </CardContent>

          </SettingsCard>

          <UnlockOptions

            embedded

            entitlements={entitlements}

            cancelAtPeriodEnd={hasCancelAtPeriodEnd}

          />

        </div>

      </AppSection>



      {profile ? (

        <AppSection

          eyebrow="Profile"

          title="Career profile"

          description="Update the inputs used to build your roadmap and weekly targets."

        >

          <ProfileEditForm profile={profile} />

        </AppSection>

      ) : null}



      {roadmaps.length > 0 ? (

        <AppSection eyebrow="Roadmaps" title="Manage roadmaps">

          <DeleteRoadmapSection roadmaps={roadmaps} />

        </AppSection>

      ) : null}



      {entitlements.isPro ? <CreateNewRoadmapLink userId={userId} /> : null}



      <AppSection eyebrow="Email" title="Email preferences">

        {entitlements.isPro && emailPrefs ? (

          <EmailPrefsSection initialPrefs={emailPrefs} />

        ) : (

          <EmailPrefsProOnly isPro={entitlements.isPro} />

        )}

      </AppSection>



      <AppSection eyebrow="Appearance" title="Display">
        <ThemeSection />
      </AppSection>


      <AppSection
        eyebrow="Danger zone"
        title="Delete account"
        description="Permanently deletes your account, roadmaps, and progress. Cancel any Pro subscription in Manage billing first if you want to stop future charges."
      >
        <DeleteAccountSection />
      </AppSection>

    </div>
  );
}
