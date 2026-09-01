"use client";



import Link from "next/link";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { marketingContainerClass, marketingPrimaryCtaClass } from "@/lib/layout/marketing";



const navLinks = [

  { href: "#how-it-works", label: "How it works" },

  { href: "#why-careerlockin", label: "Why us" },

  { href: "/pricing", label: "Pricing" },

  { href: "#faq", label: "FAQ" },

] as const;



export function LandingHeader() {

  const [menuOpen, setMenuOpen] = useState(false);



  useEffect(() => {

    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = previousOverflow;

    };

  }, [menuOpen]);



  return (

    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">

      <div className={`${marketingContainerClass} flex h-14 sm:h-16 items-center justify-between gap-3 min-w-0`}>

        <Link

          href="/"

          className="font-bold text-foreground text-base sm:text-lg no-underline hover:opacity-80 transition-opacity shrink-0"

        >

          CareerLockin

        </Link>



        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2" aria-label="Main">

          {navLinks.map((item) => (

            <Link

              key={item.href}

              href={item.href}

              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"

            >

              {item.label}

            </Link>

          ))}

        </nav>



        <div className="hidden md:flex items-center gap-3 shrink-0">

          <Link

            href="/login"

            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-11 inline-flex items-center px-2"

          >

            Sign in

          </Link>

          <Button asChild size="sm" className={marketingPrimaryCtaClass}>

            <Link href="/get-started">Create my roadmap →</Link>

          </Button>

        </div>



        <div className="flex md:hidden items-center gap-2 shrink-0">

          <Button

            type="button"

            variant="ghost"

            size="icon"

            className="size-11 rounded-xl touch-manipulation"

            onClick={() => setMenuOpen(true)}

            aria-label="Open menu"

            aria-expanded={menuOpen}

          >

            <Menu className="size-5" aria-hidden />

          </Button>

          <Button asChild size="sm" className={`${marketingPrimaryCtaClass} px-4 text-sm`}>

            <Link href="/get-started">Start →</Link>

          </Button>

        </div>

      </div>



      <div

        className={cn(

          "fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden transition-opacity duration-200",

          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"

        )}

        aria-hidden={!menuOpen}

        role="dialog"

        aria-modal={menuOpen}

        aria-label="Site menu"

      >

        <div className="flex flex-col h-full min-w-0 overflow-y-auto overscroll-contain">

          <div className="flex h-14 items-center justify-between px-4 border-b border-border/50 shrink-0">

            <span className="font-bold text-foreground">Menu</span>

            <Button

              type="button"

              variant="ghost"

              size="icon"

              className="size-11 rounded-xl touch-manipulation"

              onClick={() => setMenuOpen(false)}

              aria-label="Close menu"

            >

              <X className="size-5" aria-hidden />

            </Button>

          </div>

          <nav className="flex flex-col gap-1 p-4" aria-label="Main">

            {navLinks.map((item) => (

              <Link

                key={item.href}

                href={item.href}

                onClick={() => setMenuOpen(false)}

                className="rounded-xl px-4 py-3.5 min-h-12 flex items-center text-base text-foreground font-medium hover:bg-muted/60 transition-colors touch-manipulation"

              >

                {item.label}

              </Link>

            ))}

            <Link

              href="/login"

              onClick={() => setMenuOpen(false)}

              className="rounded-xl px-4 py-3.5 min-h-12 flex items-center text-base text-foreground font-medium hover:bg-muted/60 transition-colors touch-manipulation"

            >

              Sign in

            </Link>

            <Link

              href="/get-started"

              onClick={() => setMenuOpen(false)}

              className={`${marketingPrimaryCtaClass} mt-3 block text-center py-3.5 min-h-12 no-underline text-base touch-manipulation`}

            >

              Create my roadmap →

            </Link>

          </nav>

        </div>

      </div>

    </header>

  );

}


