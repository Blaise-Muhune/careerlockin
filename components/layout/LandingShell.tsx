import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supportEmail } from "@/lib/seo/site";

type LandingShellProps = {
  children: React.ReactNode;
};

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="font-semibold text-foreground no-underline hover:text-primary transition-colors"
          >
            CareerLockin
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Link href="#how-it-works">How it works</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Link href="#pricing">Pricing</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <a href={`mailto:${supportEmail}`}>Contact</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent/50">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Create my roadmap</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
