import Link from "next/link";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/site";
import { getAllPosts } from "@/lib/blog/posts";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles and updates from CareerLockin on tech career roadmaps, learning paths, and progress tracking.",
  alternates: { canonical: `${siteUrl}/blog` },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground mb-2">Blog</h1>
        <p className="text-muted-foreground mb-10">
          Articles and updates on tech career roadmaps and learning paths.
        </p>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <ul className="space-y-8 list-none p-0 m-0">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <time
                    dateTime={post.date}
                    className="text-sm text-muted-foreground"
                  >
                    {formatDate(post.date)}
                  </time>
                  <h2 className="mt-1 text-lg font-medium text-foreground">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline underline-offset-2"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12">
          <Button asChild variant="secondary">
            <Link href="/">Back to CareerLockin</Link>
          </Button>
        </div>
      </div>
    </div>
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
