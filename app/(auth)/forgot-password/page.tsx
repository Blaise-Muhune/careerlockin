"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { KeyRound, CheckCircle2 } from "lucide-react";
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
import { requestPasswordReset, type RequestPasswordResetState } from "@/app/actions/auth";

const forgotSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<
    RequestPasswordResetState | null,
    FormData
  >(requestPasswordReset, null);

  const {
    register,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const showCheckEmail = state?.ok === true && state?.email;

  return (
    <Card className="w-full max-w-md shadow-sm border-border">
      {showCheckEmail ? (
        <>
          <CardHeader className="text-center pb-2">
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We&apos;ve sent a password reset link to{" "}
              <span className="font-medium text-foreground">{state.email}</span>.
              Click the link to set a new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or try again
              with the same address.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-0">
            <Button asChild className="w-full" size="default">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                aria-hidden
              >
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-xl">Forgot password</CardTitle>
                <CardDescription>
                  Enter your email and we&apos;ll send you a link to reset your
                  password.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="flex flex-col gap-5">
              {state?.ok === false && state?.error && (
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
                  aria-invalid={Boolean(
                    errors.email ?? (state && !state.ok && state.fields?.email)
                  )}
                  {...register("email")}
                />
                {(errors.email?.message ??
                  (state && !state.ok && state.fields?.email)) && (
                  <p className="text-sm text-destructive">
                    {errors.email?.message ??
                      (state && !state.ok && state.fields?.email)}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isPending}
              >
                {isPending ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-primary font-medium underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </>
      )}
    </Card>
  );
}
