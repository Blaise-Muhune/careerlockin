import { requireUserForOnboarding } from "@/lib/server/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  await requireUserForOnboarding();
  return (
    <div className="flex flex-col gap-8 sm:gap-12 pb-16">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">Get started</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Set up your profile
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Same details we use when you create a roadmap—target role, pace, and how you like to learn—so
          your first plan fits your life.
        </p>
      </div>
      <OnboardingForm />
    </div>
  );
}
