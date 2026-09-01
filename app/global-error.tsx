"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const primaryBtn =
    "inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 shadow-sm transition-all";
  const secondaryBtn =
    "inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-background px-6 text-sm font-semibold hover:bg-muted/50 transition-colors";

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased marketing-dot-grid">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Error</p>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground leading-relaxed">
            We&apos;ve been notified. You can try again, or return home if the problem persists.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => reset()} className={primaryBtn}>
              Try again
            </button>
            <Link href="/" className={secondaryBtn}>
              Back to home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
