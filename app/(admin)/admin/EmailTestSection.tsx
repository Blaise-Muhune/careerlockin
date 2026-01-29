"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  testWeeklyRecapAction,
  testInactivityAction,
  testMilestonesAction,
  type EmailJobResult,
} from "@/app/actions/testEmailJobs";
import { Mail, Loader2 } from "lucide-react";

function ResultDisplay({ result }: { result: EmailJobResult | null }) {
  if (!result) return null;
  if (!result.ok) {
    return (
      <p className="text-sm text-destructive">
        {result.error}
      </p>
    );
  }
  return (
    <div className="space-y-2 text-sm">
      <p className="text-muted-foreground">
        Sent: <span className="font-medium text-foreground">{result.sent}</span>
        {result.errors.length > 0 && (
          <span className="ml-2 text-destructive">
            · {result.errors.length} error{result.errors.length === 1 ? "" : "s"}
          </span>
        )}
      </p>
      {result.errors.length > 0 && (
        <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground max-h-32 overflow-y-auto">
          {result.errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmailTestSection() {
  const [weeklyResult, setWeeklyResult] = useState<EmailJobResult | null>(null);
  const [inactivityResult, setInactivityResult] = useState<EmailJobResult | null>(null);
  const [milestonesResult, setMilestonesResult] = useState<EmailJobResult | null>(null);
  const [loading, setLoading] = useState<"weekly" | "inactivity" | "milestones" | null>(null);

  async function runWeekly() {
    setLoading("weekly");
    setWeeklyResult(null);
    try {
      const r = await testWeeklyRecapAction();
      setWeeklyResult(r);
    } finally {
      setLoading(null);
    }
  }

  async function runInactivity() {
    setLoading("inactivity");
    setInactivityResult(null);
    try {
      const r = await testInactivityAction();
      setInactivityResult(r);
    } finally {
      setLoading(null);
    }
  }

  async function runMilestones() {
    setLoading("milestones");
    setMilestonesResult(null);
    try {
      const r = await testMilestonesAction();
      setMilestonesResult(r);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="size-4" aria-hidden />
          Test email reminders
        </CardTitle>
        <CardDescription>
          Run the same jobs that cron triggers. Requires RESEND_API_KEY and EMAIL_FROM_ADDRESS. Only sends to users who have the corresponding preference enabled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-start">
          <Button
            variant="outline"
            size="sm"
            onClick={runWeekly}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === "weekly" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Weekly recap
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runInactivity}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === "inactivity" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Inactivity nudge
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={runMilestones}
            disabled={loading !== null}
            className="gap-2"
          >
            {loading === "milestones" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : null}
            Milestones (phase completed)
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="font-medium text-muted-foreground mb-1">Weekly recap</p>
            <ResultDisplay result={weeklyResult} />
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Inactivity</p>
            <ResultDisplay result={inactivityResult} />
          </div>
          <div>
            <p className="font-medium text-muted-foreground mb-1">Milestones</p>
            <ResultDisplay result={milestonesResult} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
