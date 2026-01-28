"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

  const {
    register,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create an account.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
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
              aria-invalid={Boolean(errors.password ?? state?.fields?.password)}
              {...register("password")}
            />
            {(errors.password?.message ?? state?.fields?.password) && (
              <p className="text-sm text-destructive">
                {errors.password?.message ?? state?.fields?.password}
              </p>
            )}
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept_legal"
              name="accept_legal"
              value="on"
              className="mt-1 h-4 w-4 rounded border-input accent-primary"
              aria-invalid={Boolean(state?.fields?.accept_legal)}
              aria-describedby={state?.fields?.accept_legal ? "accept_legal_error" : undefined}
            />
            <div className="grid gap-1">
              <Label
                htmlFor="accept_legal"
                className="text-sm font-normal cursor-pointer"
              >
                I accept the{" "}
                <Link
                  href="/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:no-underline"
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating account…" : "Sign up"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
