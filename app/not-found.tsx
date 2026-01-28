import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          This page doesn’t exist or may have been moved.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Go to main app</Link>
        </Button>
        <nav className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground hover:underline">
            How it works
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground hover:underline">
            Pricing
          </Link>
          <Link href="/blog" className="text-muted-foreground hover:text-foreground hover:underline">
            Blog
          </Link>
          <Link href="/legal" className="text-muted-foreground hover:text-foreground hover:underline">
            Legal
          </Link>
        </nav>
      </div>
    </div>
  );
}
