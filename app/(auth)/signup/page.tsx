"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUp, signInWithGoogle, type SignUpState } from "@/app/actions/auth";

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

const signupSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type SignUpFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState<SignUpState | null, FormData>(
    signUp,
    null
  );
  const [acceptLegal, setAcceptLegal] = useState(false);
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
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  const showCheckEmail = state?.requiresEmailConfirm === true && state?.email;

  return (
    <Card className="w-full max-w-md shadow-sm border-border">
      {showCheckEmail ? (
        <>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent a confirmation link to{" "}
              <span className="font-medium text-foreground">{state.email}</span>.
              Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try signing up again with the same address.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button asChild className="w-full" size="default">
              <Link href="/login">Back to sign in</Link>
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already confirmed?{" "}
              <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-xl">Create an account</CardTitle>
                <CardDescription>Enter your email and password to get started.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="flex flex-col gap-5">
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
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  className="h-10"
                  aria-invalid={Boolean(errors.password ?? state?.fields?.password)}
                  {...register("password")}
                />
                {(errors.password?.message ?? state?.fields?.password) && (
                  <p className="text-sm text-destructive">
                    {errors.password?.message ?? state?.fields?.password}
                  </p>
                )}
              </div>
              <div className="flex items-start gap-3 pt-1">
                <Checkbox
                  id="accept_legal"
                  checked={acceptLegal}
                  onCheckedChange={(checked) => setAcceptLegal(checked === true)}
                  aria-required="true"
                  aria-invalid={Boolean(state?.fields?.accept_legal)}
                  aria-describedby={state?.fields?.accept_legal ? "accept_legal_error" : undefined}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-tight">
                  <Label
                    htmlFor="accept_legal"
                    className="text-sm font-normal cursor-pointer text-foreground"
                  >
                    I accept the{" "}
                    <Link
                      href="/legal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:no-underline font-medium"
                    >
                      Privacy Policy and Terms of Service
                    </Link>
                  </Label>
                  {state?.fields?.accept_legal && (
                    <p id="accept_legal_error" className="text-sm text-destructive">
                      {state.fields.accept_legal}
                    </p>
                  )}
                </div>
              </div>
              <input
                type="hidden"
                name="accept_legal"
                value={acceptLegal ? "on" : ""}
                aria-hidden
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isPending || !acceptLegal}
              >
                {isPending ? "Creating account…" : "Sign up"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium underline-offset-4 hover:underline">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}
