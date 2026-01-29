"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn, signInWithGoogle, type SignInState } from "@/app/actions/auth";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
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
    <Card className="w-full max-w-md shadow-sm border-border">
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
        <CardContent className="flex flex-col gap-5">
          {resetSuccess && (
            <div
              className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 font-medium"
              role="status"
            >
              Your password has been updated. Sign in with your new password.
            </div>
          )}
          {oauthError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
              role="alert"
            >
              {oauthError === "missing_code"
                ? "Sign-in was cancelled or the link expired. Please try again."
                : oauthError}
            </div>
          )}
          {googleError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
              role="alert"
            >
              {googleError}
            </div>
          )}
          {state?.error && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
              role="alert"
            >
              {state.error}
            </div>
          )}
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
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
              <span className="bg-card px-2">or</span>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full h-10"
            disabled={isPending}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
