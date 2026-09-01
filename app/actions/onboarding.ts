"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseOnboardingFormData } from "@/lib/onboarding/schema";
import { upsertProfileForUser } from "@/lib/server/onboarding/upsertProfile";

export type OnboardingState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitOnboarding(
  _prev: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const parsed = parseOnboardingFormData(formData);

  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid input",
      fieldErrors: issues.fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/get-started");
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile) {
    redirect("/dashboard");
  }

  const result = await upsertProfileForUser(
    supabase,
    user.id,
    user.email,
    parsed.data
  );

  if (result.error) {
    return { error: result.error };
  }

  redirect("/onboarding/welcome");
}
