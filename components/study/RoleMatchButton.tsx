"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refreshRoleMatch } from "@/app/actions/studySession";
import { Button } from "@/components/ui/button";

export function RoleMatchButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    const result = await refreshRoleMatch();
    setPending(false);
    if (result.ok) {
      setMessage(result.message);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={pending}
        onClick={onClick}
      >
        {pending ? "Checking jobs…" : "Refresh role match"}
      </Button>
      {message ? <p className="max-w-md text-xs text-muted-foreground">{message}</p> : null}
      {error ? (
        <p className="max-w-md text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
