"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/seo/site";
import { parseOnboardingFormData } from "@/lib/onboarding/schema";
import { upsertProfileForUser } from "@/lib/server/onboarding/upsertProfile";

const signUpFieldsSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  accept_legal: z
    .string()
    .optional()
    .refine((v) => v === "on", {
      message: "You must accept the Privacy Policy and Terms of Service.",
    }),
});

export type CompleteGetStartedState = {
  error?: string;
  requiresEmailConfirm?: boolean;
  email?: string;
  fieldErrors?: Record<string, string>;
  signupFields?: { email?: string; password?: string; accept_legal?: string };
};

/**
 * Final get-started step: create account, persist profile, then welcome → generate.
 */
export async function completeGetStarted(
  _prev: CompleteGetStartedState | null,
  formData: FormData
): Promise<CompleteGetStartedState> {
  const profileParsed = parseOnboardingFormData(formData);
  if (!profileParsed.success) {
    const issues = profileParsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid profile details",
      fieldErrors: issues.fieldErrors as Record<string, string>,
    };
  }

  const signupParsed = signUpFieldsSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!signupParsed.success) {
    const issues = signupParsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid account details",
      signupFields: issues.fieldErrors as CompleteGetStartedState["signupFields"],
    };
  }

  const { email, password } = signupParsed.data;
  const supabase = await createClient();

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/login?next=${encodeURIComponent("/get-started/finish")}`,
    },
  });

  if (signUpError) {
    return {
      error: signUpError.message,
      signupFields: { email, password },
    };
  }

  if (data.user && !data.session) {
    return {
      requiresEmailConfirm: true,
      email,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Account created but session missing. Sign in to continue." };
  }

  const result = await upsertProfileForUser(
    supabase,
    user.id,
    user.email,
    profileParsed.data
  );

  if (result.error) {
    return { error: result.error };
  }

  redirect("/onboarding/welcome");
}
