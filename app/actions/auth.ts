"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/seo/site";

const signUpSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
  accept_legal: z
    .string()
    .optional()
    .refine((v) => v === "on", {
      message: "You must accept the Privacy Policy and Terms of Service.",
    }),
});

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpState = {
  error?: string;
  requiresEmailConfirm?: boolean;
  email?: string;
  fields?: { email?: string; password?: string; accept_legal?: string };
};

export type SignInState = {
  error?: string;
  fields?: { email?: string; password?: string };
};

export async function signUp(
  _prev: SignUpState | null,
  formData: FormData
): Promise<SignUpState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid input",
      fields: issues.fieldErrors as {
        email?: string;
        password?: string;
        accept_legal?: string;
      },
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Ensures Supabase confirmation links redirect to your real site (not localhost)
      // IMPORTANT: this URL must be allowlisted in Supabase Auth -> URL Configuration.
      emailRedirectTo: `${siteUrl}/login`,
    },
  });

  if (error) {
    return {
      error: error.message,
      fields: { email, password },
    };
  }

  if (data.user && !data.session) {
    return {
      requiresEmailConfirm: true,
      email,
    };
  }

  redirect("/onboarding");
}

export async function signIn(
  _prev: SignInState | null,
  formData: FormData
): Promise<SignInState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.flatten();
    return {
      error: issues.formErrors[0] ?? "Invalid input",
      fields: issues.fieldErrors as { email?: string; password?: string },
    };
  }

  const { email, password } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: error.message,
      fields: { email },
    };
  }

  redirect("/dashboard");
}

export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
