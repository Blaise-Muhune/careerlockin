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
import { signUp, type SignUpState } from "@/app/actions/auth";

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
            <CardFooter className="flex flex-col gap-4">
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
