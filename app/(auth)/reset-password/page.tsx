"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(Boolean(session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(values: ResetFormValues) {
    setSubmitError(null);
    setIsPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setIsPending(false);
    if (error) {
      setSubmitError(error.message);
      return;
    }
    router.push("/login?reset=success");
    router.refresh();
  }

  if (hasSession === null) {
    return (
      <Card className="w-full max-w-md shadow-sm border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasSession) {
    return (
      <Card className="w-full max-w-md shadow-sm border-border">
        <CardHeader>
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>
            Use the link from your email to reset your password. Links expire in
            1 hour. If your link expired,{" "}
            <Link href="/forgot-password" className="text-primary font-medium underline-offset-4 hover:underline">
              request a new one
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full" size="default">
            <Link href="/forgot-password">Request reset link</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full" size="default">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-sm border-border">
      <CardHeader className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
            aria-hidden
          >
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>
              Choose a new password for your account.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-5">
          {submitError && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive font-medium"
              role="alert"
            >
              {submitError}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="h-10"
              aria-invalid={Boolean(errors.password)}
              {...register("password")}
            />
            {errors.password?.message && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Same as above"
              className="h-10"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword?.message && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
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
            {isPending ? "Updating…" : "Update password"}
          </Button>
          <Button asChild variant="ghost" className="w-full" size="default">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
