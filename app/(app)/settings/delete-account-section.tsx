"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent } from "@/components/ui/card";
import { deleteAccount } from "@/app/actions/account";
import { SettingsCard } from "@/components/settings/SettingsCard";

export function DeleteAccountSection() {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const out = await deleteAccount(confirmation);
      if (out && !out.ok) {
        setError(out.error);
      }
    });
  }

  return (
    <SettingsCard danger>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delete_confirm">Type DELETE to confirm</Label>
          <Input
            id="delete_confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            className="h-10 rounded-xl max-w-sm"
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="rounded-xl"
          disabled={isPending || confirmation.trim().toUpperCase() !== "DELETE"}
          onClick={handleDelete}
        >
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </CardContent>
    </SettingsCard>
  );
}
