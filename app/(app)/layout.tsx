import type { Metadata } from "next";
import { requireUser } from "@/lib/server/auth";
import { getIsAdmin } from "@/lib/server/admin/requireAdmin";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { id } = await requireUser();
  const isAdmin = await getIsAdmin(id);
  return <AppShell isAdmin={isAdmin}>{children}</AppShell>;
}
