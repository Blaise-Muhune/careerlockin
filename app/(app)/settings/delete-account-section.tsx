"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteAccount } from "@/app/actions/account";

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
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base text-destructive">Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your account, roadmaps, and progress. Cancel any
          Pro subscription in Manage billing first if you want to stop future charges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="delete_confirm">Type DELETE to confirm</Label>
          <Input
            id="delete_confirm"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isPending || confirmation.trim().toUpperCase() !== "DELETE"}
          onClick={handleDelete}
        >
          {isPending ? "Deleting…" : "Delete my account"}
        </Button>
      </CardContent>
    </Card>
  );
}
