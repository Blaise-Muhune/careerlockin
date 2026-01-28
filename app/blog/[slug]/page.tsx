import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo/site";
import {
  getPostBySlug,
  getAllSlugs,
  type BlogPost,
} from "@/lib/blog/posts";
import { Button } from "@/components/ui/button";

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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <time
          dateTime={post.date}
          className="text-sm text-muted-foreground"
        >
          {formatDate(post.date)}
        </time>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          {post.title}
        </h1>
        <div className="mt-8 text-foreground">
          <PostBody content={post.content} />
        </div>
        <div className="mt-12">
          <Button asChild variant="secondary">
            <Link href="/blog">Back to blog</Link>
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

function PostBody({ content }: { content: BlogPost["content"] }) {
  const paragraphs = content
    .trim()
    .split(/\n\n+/)
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
          {p}
        </p>
      ))}
    </>
  );
}
