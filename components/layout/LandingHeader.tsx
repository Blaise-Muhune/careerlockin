"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supportEmail } from "@/lib/seo/site";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "#see-what-you-get", label: "Preview" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: `mailto:${supportEmail}`, label: "Contact", external: true },
];

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="font-semibold text-foreground no-underline hover:text-primary transition-colors shrink-0"
        >
          CareerLockin
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0"
          aria-label="Main"
        >
          {navLinks.map((item) =>
            item.external ? (
              <Button key={item.label} asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <a href={item.href}>{item.label}</a>
              </Button>
            ) : (
              <Button key={item.label} asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          )}
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Create my roadmap</Link>
          </Button>
        </nav>

        {/* Mobile: hamburger + primary CTA */}
        <div className="flex md:hidden items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" aria-hidden />
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Create</Link>
          </Button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden transition-opacity duration-200",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center justify-between px-4 border-b border-border/80">
            <span className="font-semibold text-foreground">Menu</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Main">
            {navLinks.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-foreground font-medium hover:bg-accent/50 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-foreground font-medium hover:bg-accent/50 transition-colors"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="flex items-center px-4 py-2 mt-2">
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-foreground font-medium hover:bg-accent/50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 mt-2 bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-center"
            >
              Create my roadmap
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
