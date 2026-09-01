import { redirect } from "next/navigation";
import { requireUserForOnboarding } from "@/lib/server/auth";

/** Legacy route — profile setup now starts at /get-started. */
export default async function OnboardingPage() {
  await requireUserForOnboarding();
  redirect("/get-started");
}
