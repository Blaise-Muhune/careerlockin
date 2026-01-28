import { requireUserForOnboarding } from "@/lib/server/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  await requireUserForOnboarding();
  return (
    <div className="flex flex-col items-center gap-10 py-10">
      <OnboardingForm />
    </div>
  );
}
