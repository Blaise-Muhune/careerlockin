"use client";

import type { ReactNode } from "react";

export type GatedProps = {
  allowed: boolean;
  fallback: ReactNode;
  children: ReactNode;
};

export function Gated({ allowed, fallback, children }: GatedProps) {
  if (allowed) return <>{children}</>;
  return <>{fallback}</>;
}

