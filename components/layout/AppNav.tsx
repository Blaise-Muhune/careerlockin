"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/settings", label: "Settings" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden md:flex items-center gap-1 lg:gap-2">
        {NAV_LINKS.map(({ href, label }) => {
          const active = isActivePath(pathname, href);
          return (
            <Button
              key={href}
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                "min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 rounded-lg",
                active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <Link href={href}>{label}</Link>
            </Button>
          );
        })}
        <ThemeToggle />
        <form action={logout} className="inline-flex">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg"
          >
            Log out
          </Button>
        </form>
      </nav>

      <div className="flex md:hidden items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-6" />
        </Button>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex flex-col gap-0 rounded-none border-0 bg-background p-6 pt-6 shadow-lg md:hidden"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <DialogTitle className="text-lg font-semibold">Menu</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] rounded-lg -mr-2"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </DialogHeader>
          <div className="flex flex-col gap-1 pt-4">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex min-h-[48px] items-center px-4 rounded-lg font-medium transition-colors touch-manipulation",
                    active
                      ? "bg-accent text-foreground"
                      : "text-foreground hover:bg-accent/50 active:bg-accent"
                  )}
                >
                  {label}
                </Link>
              );
            })}
            <div className="flex min-h-[48px] items-center px-4">
              <ThemeToggle />
            </div>
            <form action={logout} className="block">
              <button
                type="submit"
                className="flex w-full min-h-[48px] items-center px-4 rounded-lg text-left text-muted-foreground font-medium hover:bg-accent/50 hover:text-foreground active:bg-accent transition-colors touch-manipulation"
              >
                Log out
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
