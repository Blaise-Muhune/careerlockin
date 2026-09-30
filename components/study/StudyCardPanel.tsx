"use client";

import { useEffect, useState } from "react";
import {
  checkStudyCode,
  checkStudyRepo,
  loadStudyCard,
  prepareStudyCard,
  revealNextStudyStep,
  submitStudyReview,
} from "@/app/actions/studySession";
import { Button } from "@/components/ui/button";
import { appNestedSurfaceClass, appPrimaryButtonClass } from "@/lib/layout/app";
import type { StudyCardResult, StudyCardView } from "@/lib/study/types";
import { lessonWalkOpen, visibleStepCount } from "@/lib/study/lessonSteps";
import { cn } from "@/lib/utils";

const fieldClass =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

function formatDue(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function StudyCardPanel({ stepId }: { stepId: string }) {
  const [result, setResult] = useState<StudyCardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"load" | "prepare" | "review" | "code" | "repo" | "reveal" | null>(
    "load"
  );
  const [answer, setAnswer] = useState("");
  const [guess, setGuess] = useState("");
  const [source, setSource] = useState("");
  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [repoUrl, setRepoUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadStudyCard(stepId).then((next) => {
      if (cancelled) return;
      setResult(next);
      setError(next.ok ? null : next.error);
      if (next.ok && next.kind === "card" && next.card.lastAnswer) {
        setAnswer(next.card.lastAnswer);
      }
      setPending(null);
    });
    return () => {
      cancelled = true;
    };
  }, [stepId]);

  async function run(kind: "prepare" | "review" | "code" | "repo" | "reveal", task: Promise<StudyCardResult>) {
    setPending(kind);
    setError(null);
    const next = await task;
    setResult(next);
    setError(next.ok ? null : next.error);
    if (kind === "reveal" && next.ok) setGuess("");
    setPending(null);
  }

  const card = result?.ok && result.kind === "card" ? result.card : null;

  return (
    <section className={cn(appNestedSurfaceClass, "mb-5 p-4 sm:p-5")} aria-label="Today's study card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Today</p>
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {pending === "load" ? (
        <p className="mt-2 text-sm text-muted-foreground">Loading today’s task…</p>
      ) : null}
      {result?.ok && result.kind === "rest" ? (
        <p className="mt-2 text-sm text-foreground">{result.message}</p>
      ) : null}
      {result?.ok && result.kind === "empty" ? (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            One short lesson, one step at a time, then a 25-minute try.
          </p>
          <Button
            type="button"
            className={cn("mt-3 rounded-full", appPrimaryButtonClass)}
            disabled={pending != null}
            onClick={() => run("prepare", prepareStudyCard(stepId))}
          >
            {pending === "prepare" ? "Preparing…" : "Prepare today’s task"}
          </Button>
        </div>
      ) : null}
      {card ? (
        <CardBody
          card={card}
          answer={answer}
          setAnswer={setAnswer}
          guess={guess}
          setGuess={setGuess}
          source={source}
          setSource={setSource}
          language={language}
          setLanguage={setLanguage}
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          pending={pending}
          onReview={(rating) =>
            run("review", submitStudyReview({ stepId, cardId: card.id, answer, rating }))
          }
          onReveal={() =>
            run("reveal", revealNextStudyStep({ stepId, cardId: card.id, guess }))
          }
          onCode={() => run("code", checkStudyCode({ stepId, cardId: card.id, language, source }))}
          onRepo={() => run("repo", checkStudyRepo({ stepId, cardId: card.id, repoUrl }))}
        />
      ) : null}
    </section>
  );
}

function CardBody({
  card,
  answer,
  setAnswer,
  guess,
  setGuess,
  source,
  setSource,
  language,
  setLanguage,
  repoUrl,
  setRepoUrl,
  pending,
  onReview,
  onReveal,
  onCode,
  onRepo,
}: {
  card: StudyCardView;
  answer: string;
  setAnswer: (value: string) => void;
  guess: string;
  setGuess: (value: string) => void;
  source: string;
  setSource: (value: string) => void;
  language: "javascript" | "python";
  setLanguage: (value: "javascript" | "python") => void;
  repoUrl: string;
  setRepoUrl: (value: string) => void;
  pending: string | null;
  onReview: (rating: 1 | 2 | 3 | 4) => void;
  onReveal: () => void;
  onCode: () => void;
  onRepo: () => void;
}) {
  const label =
    card.displayMode === "recall"
      ? "Recall"
      : card.displayMode === "build"
        ? "Build"
        : "Example";
  const recall = card.displayMode === "recall";
  const walking = lessonWalkOpen(card.stepIndex, card.steps.length, recall);
  const shown = card.steps.slice(0, visibleStepCount(card.stepIndex, card.steps.length));

  return (
    <div className="mt-3 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 font-medium uppercase tracking-wide text-primary">
          {label}
        </span>
        <span>Next review {formatDue(card.due)}</span>
      </div>
      {card.focus ? <p className="text-sm text-foreground">{card.focus}</p> : null}
      {card.resourceUrl ? (
        <a
          href={card.resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-primary hover:underline"
        >
          {card.resourceTitle ?? "Open the source"}
        </a>
      ) : null}
      {recall ? null : shown.length > 0 ? (
        <ol className="space-y-2">
          {shown.map((step, index) => (
            <li key={`${index}-${step.slice(0, 24)}`} className="text-sm leading-relaxed text-foreground">
              <span className="mr-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Step {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Example</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{card.example}</p>
        </div>
      )}
      {walking ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">What comes next?</p>
          <textarea
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            rows={2}
            className={cn(fieldClass, "mt-2 resize-y")}
            placeholder="Say the next step before it is shown."
          />
          <Button
            type="button"
            size="sm"
            className={cn("mt-2 rounded-full", appPrimaryButtonClass)}
            disabled={pending != null || guess.trim().length === 0}
            onClick={onReveal}
          >
            {pending === "reveal" ? "Showing…" : "Show the next step"}
          </Button>
        </div>
      ) : (
        <>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Try this</p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{card.tryThis}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">From memory</p>
        <p className="mt-1 text-sm text-foreground">{card.question}</p>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={3}
          className={cn(fieldClass, "mt-2 resize-y")}
          placeholder="Answer without looking back at the example."
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {(
            [
              [1, "Again"],
              [2, "Hard"],
              [3, "Good"],
              [4, "Easy"],
            ] as const
          ).map(([rating, name]) => (
            <Button
              key={rating}
              type="button"
              size="sm"
              variant={rating === 3 ? "default" : "outline"}
              className={cn("rounded-full", rating === 3 && appPrimaryButtonClass)}
              disabled={pending != null || answer.trim().length === 0}
              onClick={() => onReview(rating)}
            >
              {pending === "review" ? "Saving…" : name}
            </Button>
          ))}
        </div>
      </div>
      {card.lastCorrection ? (
        <p className="text-sm text-foreground">{card.lastCorrection}</p>
      ) : null}
      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-foreground">Check this work</summary>
        <div className="mt-3 space-y-3">
          <label className="block text-xs text-muted-foreground">
            Language
            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value === "python" ? "python" : "javascript")
              }
              className={cn(fieldClass, "mt-1")}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </label>
          <textarea
            value={source}
            onChange={(event) => setSource(event.target.value)}
            rows={5}
            className={cn(fieldClass, "resize-y font-mono")}
            placeholder="Paste a short snippet to run."
          />
          <Button type="button" size="sm" variant="outline" className="rounded-full" disabled={pending != null} onClick={onCode}>
            {pending === "code" ? "Running…" : "Run snippet"}
          </Button>
          <input
            value={repoUrl}
            onChange={(event) => setRepoUrl(event.target.value)}
            className={fieldClass}
            placeholder="https://github.com/owner/repo"
          />
          <Button type="button" size="sm" variant="outline" className="rounded-full" disabled={pending != null} onClick={onRepo}>
            {pending === "repo" ? "Checking…" : "Check repository"}
          </Button>
          {card.checkSummary ? (
            <p className="text-sm text-muted-foreground">{card.checkSummary}</p>
          ) : null}
        </div>
      </details>
        </>
      )}
    </div>
  );
}
