"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthCard } from "@/components/auth/AuthCard";
import { appPrimaryButtonClass } from "@/lib/layout/app";
import { signIn, signInWithGoogle, type SignInState } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const oauthError = searchParams.get("error");
  const [state, formAction, isPending] = useActionState<SignInState | null, FormData>(
    signIn,
    null
  );
  const [googlePending, setGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    setGoogleError(null);
    setGooglePending(true);
    const result = await signInWithGoogle();
    setGooglePending(false);
    if ("url" in result) {
      window.location.href = result.url;
      return;
    }
    setGoogleError(result.error);
  }

  const {
    register,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthCard>
      <CardHeader className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
            <LogIn className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form action={formAction}>
        {searchParams.get("next") ? (
          <input type="hidden" name="next" value={searchParams.get("next") ?? ""} />
        ) : null}
        <CardContent className="flex flex-col gap-5">
          {resetSuccess && (
            <AuthMessage variant="success">
              Your password has been updated. Sign in with your new password.
            </AuthMessage>
          )}
          {oauthError && (
            <AuthMessage>
              {oauthError === "missing_code"
                ? "Sign-in was cancelled or the link expired. Please try again."
                : oauthError}
            </AuthMessage>
          )}
          {googleError && <AuthMessage>{googleError}</AuthMessage>}
          {state?.error && <AuthMessage>{state.error}</AuthMessage>}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10"
              aria-invalid={Boolean(errors.email ?? state?.fields?.email)}
              {...register("email")}
            />
            {(errors.email?.message ?? state?.fields?.email) && (
              <p className="text-sm text-destructive">
                {errors.email?.message ?? state?.fields?.email}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              className="h-10"
              aria-invalid={Boolean(errors.password ?? state?.fields?.password)}
              {...register("password")}
            />
            {(errors.password?.message ?? state?.fields?.password) && (
              <p className="text-sm text-destructive">
                {errors.password?.message ?? state?.fields?.password}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              <Link
                href="/forgot-password"
                className="text-primary font-medium underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full h-10"
            disabled={googlePending || isPending}
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon className="mr-2 h-4 w-4" aria-hidden />
            {googlePending ? "Redirecting…" : "Continue with Google"}
          </Button>
          <AuthDivider />
          <Button
            type="submit"
            className={`w-full h-11 ${appPrimaryButtonClass}`}
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/get-started" className="text-primary font-medium underline-offset-4 hover:underline">
              Get started
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthCard>
  );
}

function LoginCardFallback() {
  return (
    <AuthCard>
      <CardHeader className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
            <LogIn className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your email and password to continue.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" className="h-10" disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Your password" className="h-10" disabled />
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </CardFooter>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell width="narrow">
      <Suspense fallback={<LoginCardFallback />}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
