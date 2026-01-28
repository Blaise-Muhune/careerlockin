import Link from "next/link";
import { AppNav } from "./AppNav";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-background">
      <OfflineBanner />
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 min-h-[52px] w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center min-h-[44px] min-w-[44px] -ml-2 pl-2 font-semibold text-foreground no-underline hover:text-primary transition-colors rounded-lg touch-manipulation"
          >
            CareerLockin
          </Link>
          <AppNav />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl px-4 py-6 sm:px-6 sm:py-10 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  );
}
