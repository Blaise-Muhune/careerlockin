import Link from "next/link";
import { AppNav } from "./AppNav";
import { AppSidebar } from "./AppSidebar";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { appContainerClass } from "@/lib/layout/app";

type AppShellProps = {
  children: React.ReactNode;
  isAdmin?: boolean;
};

export function AppShell({ children, isAdmin = false }: AppShellProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex bg-background min-w-0 overflow-x-clip">
      <OfflineBanner />
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-4">
            <Link
              href="/dashboard"
              className="font-bold text-foreground no-underline hover:opacity-80 transition-opacity"
            >
              CareerLockin
            </Link>
            <AppNav isAdmin={isAdmin} mobileOnly />
          </div>
        </header>
        <main className="marketing-dot-grid flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
          <div className={appContainerClass}>{children}</div>
        </main>
      </div>
    </div>
  );
}
