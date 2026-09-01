"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { marketingInputShellClass, marketingPrimaryCtaClass } from "@/lib/layout/marketing";

export function LandingHeroForm() {
  const router = useRouter();
  const [role, setRole] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = role.trim();
    if (trimmed) {
      router.push(`/get-started?role=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/get-started");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-7 sm:mt-8">
      <div className={`${marketingInputShellClass} w-full max-w-none sm:max-w-lg`}>
        <Input
          type="text"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="e.g. Front-end developer"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-12 sm:h-11 px-4 text-base placeholder:text-muted-foreground/70"
          aria-label="Target role"
        />
        <Button
          type="submit"
          size="lg"
          className={`${marketingPrimaryCtaClass} w-full sm:w-auto shrink-0 text-base font-medium`}
        >
          Build my career plan →
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-3.5 tracking-wide">
        Free to start · No credit card required
      </p>
    </form>
  );
}
