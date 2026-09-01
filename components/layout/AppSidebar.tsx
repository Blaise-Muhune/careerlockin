"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Settings,
  Shield,
  ArrowUpCircle,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  appNavItemActiveClass,
  appNavItemClass,
  appNavItemInactiveClass,
  appSidebarClass,
} from "@/lib/layout/app";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Roadmap", icon: Map },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

type AppSidebarProps = {
  isAdmin?: boolean;
};

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={appSidebarClass} aria-label="App navigation">
      <div className="flex h-16 shrink-0 items-center border-b border-border/50 px-5">
        <Link href="/dashboard" className="font-bold text-lg text-foreground no-underline">
          CareerLockin
        </Link>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
        aria-label="Main"
      >
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                appNavItemClass,
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
            className={cn(
              appNavItemClass,
              isActivePath(pathname, "/admin")
                ? appNavItemActiveClass
                : appNavItemInactiveClass
            )}
          >
            <Shield className="size-4 shrink-0" aria-hidden />
            Admin
          </Link>
        ) : null}
      </nav>

      <div className="sticky bottom-0 shrink-0 border-t border-border/50 bg-card/95 p-3 backdrop-blur-sm space-y-2">
        <Button asChild className="w-full justify-start gap-2 rounded-xl shadow-sm min-h-11">
          <Link href="/settings#unlock-options">
            <ArrowUpCircle className="size-4" aria-hidden />
            Upgrade
          </Link>
        </Button>
        <form action={logout} className="flex justify-end px-1">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="min-h-10 text-muted-foreground hover:text-foreground"
          >
            Log out
          </Button>
        </form>
      </div>
    </aside>
  );
}
