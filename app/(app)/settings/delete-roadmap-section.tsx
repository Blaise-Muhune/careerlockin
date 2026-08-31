"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteRoadmap } from "@/app/actions/account";

type RoadmapRow = { id: string; target_role: string; created_at: string };

type DeleteRoadmapSectionProps = {
  roadmaps: RoadmapRow[];
};

export function DeleteRoadmapSection({ roadmaps }: DeleteRoadmapSectionProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (roadmaps.length === 0) return null;

  function handleDelete(id: string, role: string) {
    if (
      !window.confirm(
        `Delete roadmap for “${role}”? This cannot be undone.`
      )
    ) {
      return;
    }
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      const out = await deleteRoadmap(id);
      setPendingId(null);
      if (!out.ok) {
        setError(out.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Your roadmaps</CardTitle>
        <CardDescription>
          Delete a roadmap to free a slot (Pro allows up to 5).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <ul className="space-y-2">
          {roadmaps.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.target_role}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleDelete(r.id, r.target_role)}
              >
                {pendingId === r.id ? "Deleting…" : "Delete"}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
