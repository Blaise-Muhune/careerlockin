import Link from "next/link";
import type { Metadata } from "next";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { LandingReveal } from "@/components/marketing/LandingReveal";
import { marketingFeatureCardClass } from "@/lib/layout/marketing";
import { siteUrl } from "@/lib/seo/site";
import { getAllPosts } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on tech career roadmaps, learning paths, and making progress without overload.",
  alternates: { canonical: `${siteUrl}/blog` },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <MarketingPage
      width="content"
      eyebrow="Blog"
      title="Notes on career roadmaps"
      description="Practical notes on career roadmaps and learning with clarity."
    >
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts yet. Check back soon.</p>
      ) : (
        <ul className="space-y-4 list-none p-0 m-0">
          {posts.map((post, index) => (
            <li key={post.slug}>
              <LandingReveal delay={index * 0.04}>
                <article className={cn(marketingFeatureCardClass, "block")}>
                  <time dateTime={post.date} className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                    {formatDate(post.date)}
                  </time>
                  <h2 className="mt-2 text-lg font-bold text-foreground tracking-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline underline-offset-4"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {post.description}
                  </p>
                </article>
              </LandingReveal>
            </li>
          ))}
        </ul>
      )}
    </MarketingPage>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
