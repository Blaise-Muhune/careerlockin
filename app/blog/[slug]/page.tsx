import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MarketingPage } from "@/components/layout/MarketingPage";
import { marketingFeatureCardClass, marketingSectionTitleClass } from "@/lib/layout/marketing";
import { siteUrl } from "@/lib/seo/site";
import {
  getPostBySlug,
  getAllSlugs,
  type BlogPost,
} from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${siteUrl}/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <MarketingPage width="content" eyebrow="Blog">
      <p className="mb-6">
        <Link
          href="/blog"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
        >
          Back to blog
        </Link>
      </p>
      <article className={cn(marketingFeatureCardClass, "space-y-6")}>
        <header>
          <time
            dateTime={post.date}
            className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
          >
            {formatDate(post.date)}
          </time>
          <h1 className={cn(marketingSectionTitleClass, "mt-3 text-left text-2xl sm:text-3xl")}>
            {post.title}
          </h1>
        </header>
        <PostBody content={post.content} />
      </article>
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

function PostBody({ content }: { content: BlogPost["content"] }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .filter(Boolean);
  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-muted-foreground leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}
