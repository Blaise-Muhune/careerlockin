import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthState, requireUser } from "@/lib/server/auth";
import { FinishOnboardingClient } from "@/components/onboarding/FinishOnboardingClient";

export const metadata: Metadata = {
  title: "Finishing setup",
  robots: "noindex, nofollow",
};

export default async function GetStartedFinishPage() {
  await requireUser();
  const { profile } = await getAuthState();
  if (profile) redirect("/dashboard");

  return <FinishOnboardingClient />;
}
