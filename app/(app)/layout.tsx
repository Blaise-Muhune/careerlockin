import type { Metadata } from "next";
import { requireUser } from "@/lib/server/auth";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  return <AppShell>{children}</AppShell>;
}
