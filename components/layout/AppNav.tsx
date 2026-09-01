"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Map,
  Menu,
  Settings,
  Shield,
  ArrowUpCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { appNavItemActiveClass, appNavItemClass, appNavItemInactiveClass } from "@/lib/layout/app";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppNavProps = {
  isAdmin?: boolean;
  /** When true, only render the mobile menu trigger (desktop uses AppSidebar). */
  mobileOnly?: boolean;
};

export function AppNav({ isAdmin = false, mobileOnly = false }: AppNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  if (!mobileOnly) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-10 rounded-xl"
        aria-label="Open menu"
        onClick={() => setMenuOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex flex-col gap-0 rounded-none border-0 bg-background p-0 shadow-lg"
          showCloseButton={false}
        >
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border/50 px-4 py-4">
            <DialogTitle className="text-lg font-bold">Menu</DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-xl"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-5" />
            </Button>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      appNavItemClass,
                      "min-h-12 px-4",
                      active ? appNavItemActiveClass : appNavItemInactiveClass
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                );
              })}
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    appNavItemClass,
                    "min-h-12 px-4",
                    isActivePath(pathname, "/admin")
                      ? appNavItemActiveClass
                      : appNavItemInactiveClass
                  )}
                >
                  <Shield className="size-4 shrink-0" aria-hidden />
                  Admin
                </Link>
              ) : null}
            </div>
            <div className="sticky bottom-0 shrink-0 border-t border-border/50 bg-background/95 p-3 backdrop-blur-sm space-y-2">
              <Link
                href="/settings#unlock-options"
                onClick={() => setMenuOpen(false)}
                className={cn(appNavItemClass, "min-h-12 px-4", appNavItemInactiveClass)}
              >
                <ArrowUpCircle className="size-4 shrink-0" aria-hidden />
                Upgrade
              </Link>
              <form action={logout} className="block">
                <button
                  type="submit"
                  className={cn(
                    appNavItemClass,
                    "min-h-12 w-full px-4 text-left",
                    appNavItemInactiveClass
                  )}
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
