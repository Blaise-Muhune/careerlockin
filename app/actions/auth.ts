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
    .min(8, "Password must be at least 8 characters"),
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

  redirect("/get-started");
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

  const next = formData.get("next");
  const nextPath =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : null;

  if (nextPath) {
    redirect(nextPath);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/get-started");
  }

  redirect("/dashboard");
}

export type RequestPasswordResetState =
  | { ok: true; email: string }
  | { ok: false; error: string; fields?: { email?: string } };

export async function requestPasswordReset(
  _prev: RequestPasswordResetState | null,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const email = formData.get("email");
  const parsed = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email")
    .safeParse(email);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first?.message ?? "Invalid email",
      fields: { email: first?.message },
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/reset-password`,
  });
  if (error) {
    return { ok: false, error: error.message, fields: { email: error.message } };
  }
  return { ok: true, email: parsed.data };
}

export type SignInWithGoogleState =
  | { url: string }
  | { error: string };

export async function signInWithGoogle(
  options?: { onboarding?: boolean }
): Promise<SignInWithGoogleState> {
  const supabase = await createClient();
  const redirectTo =
    options?.onboarding === true
      ? `${siteUrl}/auth/callback?flow=onboarding`
      : `${siteUrl}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) return { error: error.message };
  if (!data?.url) return { error: "Failed to get Google sign-in URL" };
  return { url: data.url };
}

export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
