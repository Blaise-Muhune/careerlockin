import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/server/admin/requireAdmin";
import { logAdminAccess } from "@/lib/server/admin/logAccess";

export const metadata: Metadata = {
  title: "Admin",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();
  logAdminAccess();

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-14 min-h-[52px] w-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <span className="font-semibold text-foreground">Admin</span>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
