import Link from "next/link";
import { supportEmail } from "@/lib/seo/site";
import { marketingContainerClass } from "@/lib/layout/marketing";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className={`${marketingContainerClass} py-12 sm:py-14`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div>
            <Link href="/" className="font-bold text-lg text-foreground no-underline">
              CareerLockin
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-sm leading-relaxed">
              Clear tech career roadmaps and optional progress tracking.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Product</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/get-started" className="hover:text-foreground transition-colors">Create roadmap</Link>
                <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Company</p>
              <div className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <Link href="/legal" className="hover:text-foreground transition-colors">Legal</Link>
                <a href={`mailto:${supportEmail}`} className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border/50">
        <div className={`${marketingContainerClass} py-6 text-sm text-muted-foreground`}>
          CareerLockin. Tech career roadmaps and progress tracking.
        </div>
      </div>
    </footer>
  );
}
