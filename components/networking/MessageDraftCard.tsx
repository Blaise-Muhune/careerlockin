"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CHANNEL_LABELS,
  type MessageDraft,
} from "@/lib/networking/draftTypes";
import { appNestedSurfaceClass, appPrimaryButtonClass } from "@/lib/layout/app";
import { cn } from "@/lib/utils";

type MessageDraftCardProps = {
  draft: MessageDraft;
  className?: string;
  /** Compact for dashboard. */
  compact?: boolean;
};

function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => copyTextFallback(text)
    );
  }
  return Promise.resolve(copyTextFallback(text));
}

function copyTextFallback(text: string): boolean {
  if (typeof document === "undefined") return false;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    document.body.removeChild(textarea);
    return false;
  }
}

function bracketTokens(body: string): string[] {
  const matches = body.match(/\[[^\]]+\]/g) ?? [];
  return [...new Set(matches)];
}

export function MessageDraftCard({
  draft,
  className,
  compact = false,
}: MessageDraftCardProps) {
  const [copied, setCopied] = useState<"body" | "subject" | null>(null);
  const brackets = bracketTokens(draft.body);

  async function handleCopyBody() {
    const ok = await copyText(draft.body);
    if (ok) {
      setCopied("body");
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  async function handleCopySubject() {
    if (!draft.subject_line) return;
    const ok = await copyText(draft.subject_line);
    if (ok) {
      setCopied("subject");
      window.setTimeout(() => setCopied(null), 2000);
    }
  }

  return (
    <div className={cn(appNestedSurfaceClass, "p-3 space-y-2.5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-bold text-foreground">{draft.title}</p>
          <p className="text-xs text-muted-foreground">{CHANNEL_LABELS[draft.channel]}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {draft.subject_line ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopySubject}
              className="min-h-8 rounded-full text-xs"
            >
              {copied === "subject" ? "Subject copied" : "Copy subject"}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={handleCopyBody}
            className={cn("min-h-8 min-w-22 rounded-full text-xs", appPrimaryButtonClass)}
          >
            {copied === "body" ? "Copied!" : "Copy message"}
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{draft.instruction}</p>

      {draft.subject_line && !compact ? (
        <p className="text-xs text-foreground">
          <span className="text-muted-foreground">Subject: </span>
          {draft.subject_line}
        </p>
      ) : null}

      <pre
        className={cn(
          "whitespace-pre-wrap rounded-xl border border-border/40 bg-background px-3 py-2.5 font-sans text-sm text-foreground leading-relaxed",
          compact ? "max-h-40 overflow-y-auto" : ""
        )}
      >
        {draft.body}
      </pre>

      {brackets.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Fill before sending:{" "}
          <span className="text-foreground/80">{brackets.join(" · ")}</span>
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">{draft.personalize_hint}</p>
    </div>
  );
}
