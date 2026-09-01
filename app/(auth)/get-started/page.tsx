import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthState } from "@/lib/server/auth";
import { GetStartedWizard } from "@/components/onboarding/GetStartedWizard";

export const metadata: Metadata = {
  title: "Get started",
  description:
    "Tell us your target role and weekly hours, then create your account to build your career roadmap.",
};

import { AuthPageShell } from "@/components/auth/AuthPageShell";

function GetStartedFallback() {
  return (
    <AuthPageShell width="wide">
      <div className="py-16 text-center text-muted-foreground">Loading…</div>
    </AuthPageShell>
  );
}

export default async function GetStartedPage() {
  const { user, profile } = await getAuthState();
  if (profile) redirect("/dashboard");

  return (
    <Suspense fallback={<GetStartedFallback />}>
      <GetStartedWizard isAuthed={Boolean(user)} />
    </Suspense>
  );
}
