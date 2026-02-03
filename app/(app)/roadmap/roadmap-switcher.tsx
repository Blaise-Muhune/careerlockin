"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { useState } from "react";

type RoadmapItem = {
  id: string;
  target_role: string;
  created_at: string;
};

type RoadmapSwitcherProps = {
  roadmaps: RoadmapItem[];
  currentId: string;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function RoadmapSwitcher({ roadmaps, currentId }: RoadmapSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const current = roadmaps.find((r) => r.id === currentId);

  function handleSelect(id: string) {
    setOpen(false);
    if (id === currentId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.push(`/roadmap?${params.toString()}`);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <span className="truncate max-w-[140px]">
          {current?.target_role ?? "Roadmap"}
        </span>
        <ChevronDown className="size-4 shrink-0" aria-hidden />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Switch roadmap</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-1">
            {roadmaps.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(r.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    r.id === currentId
                      ? "bg-accent text-foreground"
                      : "text-foreground hover:bg-accent/50"
                  }`}
                >
                  <span className="block truncate">{r.target_role}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {formatDate(r.created_at)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
