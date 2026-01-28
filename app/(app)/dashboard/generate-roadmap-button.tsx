"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateRoadmap } from "@/app/actions/generateRoadmap";

export function GenerateRoadmapButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleGenerate() {
    setError(null);
    startTransition(() => {
      generateRoadmap().then((result) => {
        if (result.ok) {
          router.push("/roadmap");
        } else {
          setError(result.error);
        }
      });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={handleGenerate} disabled={isPending}>
        {isPending ? "Creating…" : "Create my roadmap"}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
