"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { appPrimaryButtonClass, appSurfaceCardClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error(error);
    }
  }, [error]);

  return (
    <div
      className={cn(
        appSurfaceCardClass,
        "mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Error</p>
      <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        An unexpected error occurred. You can try again or return to the dashboard.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={reset} className={cn("rounded-full", appPrimaryButtonClass)}>
          Try again
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
